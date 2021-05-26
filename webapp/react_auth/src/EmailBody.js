import React from 'react'
import './EmailBody.css'
import ExpandCollapse from 'react-expand-collapse';

function EmailBody({description, subject}) {
    const options = {
        previewHeight: "88px"
      };
    return (
        <div className="emailrow__body">
                <div className="content-box">
                <div className="example__card">
                    <ExpandCollapse {...options}>
                        <p className="description">{description}</p>
                    </ExpandCollapse>
                </div>
            </div>
        </div>
    );
}

export default EmailBody