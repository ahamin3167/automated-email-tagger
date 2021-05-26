from allauth.socialaccount.providers.facebook.views import FacebookOAuth2Adapter
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from django.http import HttpResponse
from django.http import HttpResponseRedirect
from django.http import HttpRequest
from urllib.parse import urlencode
from textblob import TextBlob
import requests
import base64
import pymongo
import json
import os
import random
from datetime import datetime
import math

# os.environ['CUDA_VISIBLE_DEVICES'] = '-1'

# for personal vs. professional model
from numpy import loadtxt
import pandas as pd
from keras.models import load_model
from keras.preprocessing.text import Tokenizer
from keras.preprocessing.sequence import pad_sequences
import re
import string
from nltk.corpus import stopwords

from rest_auth.registration.views import SocialLoginView

abspath = os.path.abspath(__file__)
dname = os.path.dirname(abspath)
os.chdir(dname)

token = ""
googleId = ""

###########################################################
# mongo things
f = open('configuration.json')
mongocreds = json.load(f)

mongo_client = pymongo.MongoClient(
    "mongodb://tempuser:%s@4440cluster0-shard-00-00.m6n7n.mongodb.net:27017,4440cluster0-shard-00-01.m6n7n.mongodb.net:27017,4440cluster0-shard-00-02.m6n7n.mongodb.net:27017/%s?ssl=true&replicaSet=atlas-2m38u2-shard-0&authSource=admin&retryWrites=true&w=majority" % (
    mongocreds["mongo_password"], mongocreds["mongo_db"]))
mongo_db = mongo_client[mongocreds["mongo_db"]]


# mongo_cursor = mongo_collection.find({})

###########################################################

class GoogleLogin(SocialLoginView):
    adapter_class = GoogleOAuth2Adapter


@api_view(['GET'])
def gethello(request):
    return HttpResponse('hello world')


@api_view(['PUT'])
def update_credentials(request):
    global token
    token = request.data['accessToken']
    global googleId
    googleId = request.data['ft']['Qt']
    init_mongo_user()
    return HttpResponse()


# @api_view(['GET'])
# def get_emails_TEMP(request):
#     endpoint = "https://gmail.googleapis.com/gmail/v1/users/%s/messages" % googleId
#     second = "Bearer " + token
#     headers = {"Authorization": second}
#     resp = requests.get(endpoint, headers=headers)

#     data = resp.json()
#     emails = []
#     for i in data['messages']:
#         endpoint = "https://gmail.googleapis.com/gmail/v1/users/%s/messages/%s" % (googleId, i['id'])
#         second = "Bearer " + token
#         headers = {"Authorization": second}
#         response = requests.get(endpoint, headers=headers)
#         indata = response.json()
#         emails.append(indata)

#     return HttpResponse(json.dumps(emails))

@api_view(['GET'])
def get_emails(request):
    endpoint = "https://gmail.googleapis.com/gmail/v1/users/%s/messages" % googleId
    second = "Bearer " + token
    headers = {"Authorization": second}
    resp = requests.get(endpoint, headers=headers)

    data = resp.json()
    # ^ store data['messages'] in mongo!

    emails = []
    email_ids = []
    saved_emails = set()  # set of email ids already in mongo
    return_list = []  # list of emails to return to app.js

    mongo_collection = mongo_db[mongocreds["mongo_collection_emails"]]
    check = mongo_collection.find({"_id": googleId})
    for doc in check:
        saved_emails = set(doc["email_ids"])
        for emailDict in doc["emails"]:
            for ekey in emailDict:
                if ekey in saved_emails:
                    return_list.append(emailDict[ekey])

    for i in data['messages']:
        # this should only be done if the email is currently not in mongo. maybe add a separate list for all current ids stored in mongo?
        email_ids.append(i['id'])

        if (i['id'] in saved_emails):
            continue

        endpoint = "https://gmail.googleapis.com/gmail/v1/users/%s/messages/%s" % (googleId, i['id'])
        second = "Bearer " + token
        headers = {"Authorization": second}
        response = requests.get(endpoint, headers=headers)

        indata = response.json()
        temp = [{
            i['name']: i['value']
        } for i in indata['payload']['headers'] if
            (i['name'] == 'Subject' or i['name'] == 'Date' or i['name'] == 'From')]
        temp_flatten = {}
        for d in temp:
            temp_flatten.update(d)
        if indata['payload']['mimeType'] == "multipart/alternative":
            try:
                email_body = base64.urlsafe_b64decode(indata['payload']['parts'][0]['body']['data']).decode("ascii")
            except:
                email_body = "Email Failed"
            email_length = indata['payload']['parts'][0]['body']['size']
        else:
            try:
                email_body = base64.urlsafe_b64decode(indata['payload']['body']['data']).decode("ascii")
            except:
                email_body = "Email Failed"
            email_length = indata['payload']['body']['size']
        email_body = email_body[:len(email_body) - 2]
        emails.append({
            'email_id': indata['id'],
            'email_date': temp_flatten['Date'],
            'email_body': email_body,
            'email_subject': temp_flatten['Subject'],
            'email_sender': temp_flatten['From'],
            'email_length': email_length
        })

    store_mongo_emails(emails, email_ids)
    return_list += emails
    tempret_list = sorted(return_list, key=lambda x: datetime(int(x["email_date"].split(" ")[3]), datetime.strptime(x["email_date"].split(" ")[2], "%b").month, int(x["email_date"].split(" ")[1])), reverse=True)
    return HttpResponse(json.dumps(tempret_list))

def init_mongo_user():
    mongo_collection = mongo_db[mongocreds["mongo_collection_user"]]
    check = mongo_collection.find({"_id": googleId})
    for doc in check:
        # there exists something in our collection with googleId
        return
    temp_dict = {
        "_id": googleId,
        "weights":{
            "responseWeight": 0,
            "positiveWeight": 0, 
            "negativeWeight": 0,
            "neutralWeight": 0,
            "personalWeight": 0,
            "professionalWeight": 0,
        }
    }
    mongo_collection.insert(temp_dict)


def store_mongo_emails(email_list, email_ids):
    # replace randoms with calls to model
    # don't need to store email whatever whatever, just need to store email id and stuff whoops - jk, storing emails due to being able to collect all emails with a single call - this is good for querying instead of making so many API calls to google, might reconsider if google had a bulk api call
    mongo_collection = mongo_db[mongocreds["mongo_collection_emails"]]
    check = mongo_collection.find({"_id": googleId})
    for doc in check:
        new_list = update_tags(email_list)  # new_list is dict of k:v where k is email id
        # there exists something in our collection with googleId
        mongo_collection.update({"_id": googleId},
                                {'$push': {
                                    'emails': {
                                        '$each': new_list
                                    }
                                }})

        mongo_collection.update({"_id": googleId},
                                {'$set': {
                                    'email_ids': email_ids
                                }})
        return

    new_list = update_tags(email_list)
    # new_list = [{k: v for k, v in d.items() if k == 'email_id'} for d in email_list]
    temp_dict = {
        "_id": googleId,
        "email_ids": email_ids,
        "emails": new_list
    }

    mongo_collection.insert(temp_dict)


def update_tags(email_list):
    mongo_collection = mongo_db[mongocreds["mongo_collection_emails"]]
    check = mongo_collection.find({"_id": googleId})
    new_list = {}
    for d in email_list:
        for k, v in d.items():
            if k == 'email_id':
                new_list.update({v: d})

    # this code below might be unneeded considering the checks i do earlier, check it out later
    for doc in check:
        for email in doc["emails"]:
            for ekey in email:
                if ekey in new_list.keys():
                    del new_list[ekey]
                else:
                    x = 2
                    # delete from mongo (add to list, batch delete)?
                    # nvm, don't need to delete from mongo if we are able to store email id list

    ret = []
    response = ["True", "False"]
    personal = ["True", "False"]
    sentiment = ["Positive", "Neutral", "Negative"]
    for k, v in new_list.items():
        # send data in v to model, return the three labels
        # TODO: model integrations
        # replace the random.choice() things below with functions that return strings. The functions should hopefully return strings "True"/"False" for response and personal, "Positive"/"Neutral"/"Negative" for sentiment.  Once the functions have been created and are called as below (see the next TODO comment)
        v.update({
            "tags":{
                    # "response_tag": random.choice(response),
                    "response_tag": responseModel(v),
                    # TODO: replace random.choice with functions.
                    # For example, 2 lines above should actually be something like:
                    # "response_tag": responseModel(v)
                    # take a look at the next TODO to see what an example function might look like
                    # "personal_tag": random.choice(personal),
                    "personal_tag": ppModel(v),
                    # "sentiment_tag": random.choice(sentiment),
                    "sentiment_tag": sentimentModel(v)

            }
        })
        # del v["email_id"] =  don't need this because frontend pushes to backend what is the email id of the email that is thumbed up/down in order to shift the tag weights
        dictToAdd = {
            k: v
        }
        ret.append(dictToAdd)

    return ret

## personal vs. professional model

# TODO: whoever demoing needs to change these paths
model = load_model('C:/Users/ahami/OneDrive/Desktop/dev/CS4440_project/ML/RyanLe/personal_professional.h5')  # TODO: located in ML/RyanLe/personal_professional.h5
# prepare tokenizer
pp_dir = "C:/Users/ahami/OneDrive/Desktop/dev/CS4440_project/ML/RyanLe/professional_personal_v2.csv" # TODO: located in ML/RyanLe/professional_personal_v2.csv
# load data
data = pd.read_csv(pp_dir)
input_data = data['text']
t = Tokenizer()
# fit the tokenizer on the docs
t.fit_on_texts(input_data) # input_data == Series
vocab_size = len(t.word_index) + 1

def clean(x):
    # lowercasing all the words
    x = x.lower()

    # remove extra new lines
    x = re.sub(r'\n+', ' ', x)

    # removing (replacing with empty spaces actually) all the punctuations
    x = re.sub("[" + string.punctuation + "]", " ", x)

    # remove extra white spaces
    x = re.sub(r'\s+', ' ', x)

    stop = stopwords.words('english')
    new = ""
    for word in x.split():
        if word not in stop:
            new += " " + word
    return new


def preprocess(x):
    email = [clean(x)]
    # integer encode the documents
    email_encoded_docs = t.texts_to_sequences(email)
    max_length = 150
    # pad documents to a max length of 150 words
    text = pad_sequences(email_encoded_docs, maxlen=max_length, padding='post')
    return text


def ppModel(email):
    body = email["email_body"] # this will reference the body of the email
    subject = email["email_subject"] # this will reference the subject of the email
    text = subject + " " + body
    preprocessed = [preprocess(text)]
    output = model.predict(preprocessed)
    #print("Output: {}".format(output))
    if (output[0][0] > output[0][1]):
        return "True"
    return "False"

def responseModel(email):
    subject = email["email_subject"]
    body = email["email_body"]

    words = subject.split() + body.split()

    tuningXGoal = 2
    if len(words) > 100:
        tuningXGoal = 4
    if len(words) > 400:
        tuningXGoal = 7

    replyCount = 0

    #Adapted version of rule based system from paper
    for term in words:
        newTerm = ""
        punctuations = '''!()-[]{};:'" \,<>./@#$%^&*_~'''
        months = {"jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "sept", "oct", "nov", "dec",
        "january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"}
        for char in term:
            if char not in punctuations and char != " ":
                newTerm += char.lower()

        if newTerm in {"must", "should", "priority", "how", "need", "send"}:
            replyCount += 1
        if newTerm in {"dear", "hello", "hi", "please"}:
            replyCount += 1
        if newTerm in {"respond", "asap", "reply", "explain", "explanation", "urgent", "now", "soon", "send", "provide"}:
            replyCount += 1
        if "?" in newTerm:
            replyCount += 3
        if newTerm in {"am", "pm"}:
            replyCount += 1

    result = "False"

    if replyCount > tuningXGoal:
        result = "True"

    return result

def sentimentModel(email):
    subject = email["email_subject"]
    body = email["email_body"]

    sentiment = 0

    subject = subject.replace("\n", "")
    body = body.replace("\n", "")

    blob = TextBlob(subject)
    for sentence in blob.sentences:
        sentiment += blob.sentiment.polarity

    blob = TextBlob(body)
    for sentence in blob.sentences:
        # print(sentence + ": " + str(blob.sentiment.polarity))
        sentiment += blob.sentiment.polarity

    # for term in words:
    #     newTerm = ""
    #     punctuations = '''!()-[]{};:'"\,<>./@#$%^?&*_~'''
    #     for char in term:
    #         if char not in punctuations:
    #             newTerm += char.lower()

    #     blob = TextBlob(newTerm)
    #     print(newTerm + ": " + str(blob.sentiment.polarity))
    #     sentiment += blob.sentiment.polarity

    if sentiment > 0.3:
        return "Positive"
    elif sentiment < -0.3:
        return "Negative"
    else:
        return "Neutral"


# TODO: example of what a model function might look like
# def responseModel(email):
#     a = email["body"] # this will reference the body of the email
#     b = email["subject"] # this will reference the subject of the email
#     output = performModel(a, b) # this should hopefully output a string "True" or "False" as to whether the email needs a response based upon the body and subject
#     return output

@api_view(['PUT'])
def query_by_tag(request):
    if request.data["Personal"] == True:
        personalTag = "True"
        boolPersonal = True
    elif request.data["Professional"] == True:
        personalTag = "False"
        boolPersonal = True
    else:
        boolPersonal = False

    if request.data["Respond"] == True:
        responseTag = "True"
        boolResponse = True
    else:
        boolResponse = False

    if request.data["Positive"] == True:
        sentimentTag = "Positive"
        boolSentiment = True
    elif request.data["Neutral"] == True:
        sentimentTag = "Neutral"
        boolSentiment = True
    elif request.data["Negative"] == True:
        sentimentTag = "Negative"
        boolSentiment = True
    else:
        boolSentiment = False

    if int(request.data["MinLength"]) > 0:
        minLength = int(request.data["MinLength"])
        boolMin = True
    else:
        boolMin = False

    if int(request.data["MaxLength"]) > 0:
        maxLength = int(request.data["MaxLength"])
        boolMax = True
    else:
        boolMax = False

    if request.data["StartDate"] != None:
        startDate = datetime.strptime(request.data["StartDate"], '%Y-%m-%d')
        boolStart = True
    else:
        boolStart = False

    if request.data["EndDate"] != None:
        endDate = datetime.strptime(request.data["EndDate"], '%Y-%m-%d')
        boolEnd = True
    else:
        boolEnd = False

    mongo_collection = mongo_db[mongocreds["mongo_collection_emails"]]
    check = mongo_collection.find({"_id": googleId})
    ret = []
    for doc in check:
        for email in doc["emails"]:
            for k in email:
                currDate = datetime(int(email[k]["email_date"].split(" ")[3]), datetime.strptime(email[k]["email_date"].split(" ")[2], "%b").month, int(email[k]["email_date"].split(" ")[1]))
                if ((not boolResponse or email[k]['tags']['response_tag'] == responseTag) and (not boolPersonal or email[k]['tags']['personal_tag'] == personalTag) and (not boolSentiment or email[k]['tags']['sentiment_tag'] == sentimentTag) and (not boolMin or email[k]['email_length'] > minLength) and (not boolMax or email[k]['email_length'] < maxLength) and (not boolStart or startDate <= currDate) and (not boolEnd or endDate >= currDate)):
                    ret.append(email[k])
    
    return_list = sorted(ret, key=lambda x: datetime(int(x["email_date"].split(" ")[3]), datetime.strptime(x["email_date"].split(" ")[2], "%b").month, int(x["email_date"].split(" ")[1])), reverse=True)
    return HttpResponse(json.dumps(return_list))


## things for analytics
@api_view(['GET'])
def get_analytics(request):
    mongo_collection = mongo_db[mongocreds["mongo_collection_emails"]]
    check = mongo_collection.find({"_id":googleId})
    # past = {}
    retlist = {}
    date_dict = {} # maps days ago to number of tags
    length_dict = {} # maps email length to number of tags
    total_dict = { # total number of each type of tag
        "response": 0,
        "professional": 0,
        "personal": 0,
        "positive": 0,
        "neutral": 0,
        "negative": 0
    }
    currdate = datetime.now()
    for doc in check:
        for email in doc["emails"]:
            for ekey in email:
                date_array = email[ekey]["email_date"].split(" ")
                month_name = date_array[2]
                datetime_object = datetime.strptime(month_name, "%b")
                month_number = datetime_object.month
                email_date = datetime(int(date_array[3]), month_number, int(date_array[1]))
                delta = currdate - email_date
                days_ago = str(delta.days)
                length_bin = str(email[ekey]["email_length"] // 100 * 100)
                if days_ago not in date_dict.keys():
                    date_dict.update({
                        days_ago: {
                            "response": 0,
                            "professional": 0,
                            "personal": 0,
                            "positive": 0,
                            "neutral": 0,
                            "negative": 0
                        }
                    })

                if length_bin not in length_dict.keys():
                    length_dict.update({
                        length_bin: {
                            "response": 0,
                            "professional": 0,
                            "personal": 0,
                            "positive": 0,
                            "neutral": 0,
                            "negative": 0
                        }
                    })

                # create the list for how many days ago, email length, and tags
                if email[ekey]["tags"]["response_tag"] == "True":
                    date_dict[days_ago]["response"] += 1
                    length_dict[length_bin]["response"] += 1
                    total_dict["response"] += 1

                if email[ekey]["tags"]["personal_tag"] == "True":
                    date_dict[days_ago]["personal"] += 1
                    length_dict[length_bin]["personal"] += 1
                    total_dict["personal"] += 1
                else:
                    date_dict[days_ago]["professional"] += 1
                    length_dict[length_bin]["professional"] += 1
                    total_dict["professional"] += 1

                if email[ekey]["tags"]["sentiment_tag"] == "Positive":
                    date_dict[days_ago]["positive"] += 1
                    length_dict[length_bin]["positive"] += 1
                    total_dict["positive"] += 1
                elif email[ekey]["tags"]["sentiment_tag"] == "Neutral":
                    date_dict[days_ago]["neutral"] += 1
                    length_dict[length_bin]["neutral"] += 1
                    total_dict["neutral"] += 1
                else:
                    date_dict[days_ago]["negative"] += 1
                    length_dict[length_bin]["negative"] += 1
                    total_dict["negative"] += 1

    retlist.update({
        "date_data": date_dict,
        "length_data": length_dict,
        "total_data": total_dict
    })
    # retlist.append(date_dict)
    # retlist.append(length_dict)
    # retlist.append(total_dict)
    return HttpResponse(json.dumps(retlist))

@api_view(['PUT'])
def shift_weights(request):
    # take an email id
    # check if email id is in "used" pile in mongo (consider this)
    # if so, do nothing
    # if not, pull weights (maybe create a local variable within this file), make the proper changes based on sigmoid, push back
    mongo_collection = mongo_db[mongocreds["mongo_collection_emails"]]
    check = mongo_collection.find({"_id":googleId})

    mongo_collection = mongo_db[mongocreds["mongo_collection_user"]]
    tempcheck = mongo_collection.find({"_id":googleId})
    add = 0

    if request.data["reaction"] == "thumbs_up":
        add = 1
    else:
        add = -1

    for doc in tempcheck:
        usercheck = doc
        break

    for doc in check:
        for email in doc["emails"]:
            for ekey in email:
                if ekey == request.data["email_id"]:
                    if email[ekey]["tags"]["response_tag"] == "True":
                        usercheck["weights"]["responseWeight"] += add

                    if email[ekey]["tags"]["personal_tag"] == "True":
                        usercheck["weights"]["personalWeight"] += add
                    else:
                        usercheck["weights"]["professionalWeight"] += add

                    if email[ekey]["tags"]["sentiment_tag"] == "Positive":
                        usercheck["weights"]["positiveWeight"] += add
                    elif email[ekey]["tags"]["sentiment_tag"] == "Neutral":
                        usercheck["weights"]["neutralWeight"] += add
                    else:
                        usercheck["weights"]["negativeWeight"] += add

                    mongo_collection.update({"_id":googleId}, 
                    { '$set': { 
                        'weights': usercheck["weights"]
                    }})

                    return HttpResponse()
    return HttpResponse()

@api_view(['GET'])
def get_sorted_emails(request):
    # do the thing where we just return all the emails sorted in some order
    mongo_collection = mongo_db[mongocreds["mongo_collection_emails"]]
    check = mongo_collection.find({"_id":googleId})

    mongo_collection = mongo_db[mongocreds["mongo_collection_user"]]
    usercheck = mongo_collection.find({"_id":googleId})

    for doc in usercheck:
        #PERFORM SIGMOID ON ALL RHS
        responseWeight = sigmoid(doc["weights"]["responseWeight"])
        if(doc["weights"]["responseWeight"] < 0):
            responseWeight = -responseWeight
        positiveWeight = sigmoid(doc["weights"]["positiveWeight"])
        negativeWeight = sigmoid(doc["weights"]["negativeWeight"])
        neutralWeight = sigmoid(doc["weights"]["neutralWeight"])
        personalWeight = sigmoid(doc["weights"]["personalWeight"])
        professionalWeight = sigmoid(doc["weights"]["professionalWeight"])
        break

    for doc in check:
        # manage deleted emails
        # somehow incorportate date
        email_list = doc["emails"]
        # fancy sorting list:
        # https://stackoverflow.com/questions/55645334/sort-dict-by-value-in-list-of-nested-dict
        temp = sorted(email_list, key=lambda x: responseWeight * int(x[list(x.keys())[0]]["tags"]["response_tag"] == "True") + positiveWeight * int(x[list(x.keys())[0]]["tags"]["sentiment_tag"] == "Positive") + neutralWeight * int(x[list(x.keys())[0]]["tags"]["sentiment_tag"] == "Neutral") + negativeWeight * int(x[list(x.keys())[0]]["tags"]["sentiment_tag"] == "Negative") + personalWeight * int(x[list(x.keys())[0]]["tags"]["personal_tag"] == "True") + professionalWeight * int(x[list(x.keys())[0]]["tags"]["personal_tag"] == "False"), reverse=True)


        retlist = [i[list(i.keys())[0]] for i in temp]
        return HttpResponse(json.dumps(retlist))

    return HttpResponse()

## personalized inbox stuff
## using sigmoid for changing the weights

def sigmoid(input):
    return 1/(1+math.exp(-.2 * input))
