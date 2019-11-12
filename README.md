# oapiserver
orcseven api

<! SysAdmin >
====================================================================================
_>  POST /sign-up {
        "REQ_CONTEX":606060,
        "REQ_ACTION":60100,
        "REQ_INPUTS":{
            "name": "OS RAFAEL", 
            "email": "o*****o@gmail.com", 
            "mobile": "+351913859000",
            "secret": "rT444dF0",
            "confirmSecret": "rT444dF0"
        }
    }
    RESPONSE /sign-up {
        "iook": true,
        "success": "Registration has been successfully completed. ",
        "error": null,
        "data": null
    }
====================================================================================
_> POST /sign-in
    {
        "REQ_CONTEX": 606060,
        "REQ_ACTION": 60200,
        "REQ_INPUTS": {
            "email": "o*****o@gmail.com",
            "secret": "rT444dF0"
        }
    }
RESPONSE  {
        "iook": true,
        "success": null,
        "error": null,
        "data": {
            "message": "Login has been successfully!",
            "token_session":                                                                          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVkYzg1ZDAxNDA1Y2M2NTYyNDQxOWM5YyIsImFwcENvbnRleHQiOjYwNjA2MCwiaWF0IjoxNTczNDEyMzcwLCJleHAiOjE1NzM0MTQxNzB9.x2cVBt3VkZRHqg7XNIn9OZT3Kwj_yNJ17L93lDm2OwY"
        }
    }
====================================================================================
_> POST /account-verification {
        HEADER: Authorization: Bearer token_session
        "REQ_CONTEX": 606060,
        "REQ_ACTION": 60300,
        "REQ_INPUTS": {}
    }
RESPONSE {
    "iook": true,
    "success": null,
    "error": null,
    "data": {
        "to": "account-validation",
        "message": "We have sent you the verification code for your account. "
    }
}
====================================================================================
  '/request-account-verification-token'
====================================================================================
  '/request-account-recovery-token'
====================================================================================
  '/auto-seed-aux-models'
====================================================================================
<! SysAdmin >