- Account Manager 
    SysAccounts {
        id: long,
        sysUserId: long,
        status: number,
        token: string,
        appContext: number,
        dateCreated: date,
        dateUpdate: date
    }
    SysUser {
        id: long,
        name: string,
        email: string,
        mobile: string
        secret: string,
        type: number,
        dateCreated: date,
        dateUpdate: date
    }
- models to seed
    SysUserTypes {
        label: string,
        type: number,
        dateCreated: date,
        dateUpdate: date
    }
    SysAppContext {
        id: long,
        label: string,
        appContext: number,
        dateCreated: date,
        dateUpdate: date
    }
    SysAccountsStatus {
        id: long,
        label: string,
        status: number,
        dateCreated: date,
        dateUpdate: date
    }
- seed users types
    SysUserTypes({label: 'admin', type: 1000});
    SysUserTypes({label: 'user', type: 500});
    SysUserTypes({label: 'guest', type: 100});
    SysUserTypes({label: 'back-office', type: 2000});
    SysUserTypes({label: 'tester', type: 3000});
- seed app context
    SysAppContext({label: 'portal-app', appContext: 1572475699084});
    SysAppContext({label: 'adminSys', appContext: 1572475714900});
- seed account status
    SysAccountsStatus({label: 'disabled', status: -100});
    SysAccountsStatus({label: 'enable', status: 100});
    SysAccountsStatus({label: 'onValidation', status: 200});

+ SignUp / create New User And Account @begin
        /** insert new sys user: **/
        <request: data: {{name: 'OSCAR RAFAEL', email: 'oscar@email.com', secret: 'rT444dF0'}}>
        < data.user: 500 
        > insert SysUser(data);    
        < sysUserId: 1572476377213 (SysUser.id)
        /** insert new sys account **/
        - block@begin> createAccount 
            < generateToken(): 'F9ZZ-S5TF-1AWE-P20X'
            > insert SysAccounts({sysUserId: 1572476377213, status: 200, token: 'F9ZZ-S5TF-1AWE-P20X', appContext: 1572475699084});
        - block@end> createAccount 
        /** insert new sys account **/
        <sent-email: sysUserId, 'success registation'>  
        <response: 200, 'success registation'>
+ SignIn / new session @begin
        <request: data: {email: 'oscar@email.com', secres: 'rT444dF0'}>
        > query select SysUser @by (data.email && data.secret)
        < goodLogin: true
        > #IF goodLogin 
            <response: 200, {sessionData}>
        < #ELSE <response: 401, 'Unauthorized'> #ENDELSE
+ Account Status Verification @begin
        <@object function accountStatusVerification: sysAccount (
            > #IF (sysAccount.status == 200) // account onValidation
                > #IF (sysAccount.token.length <= 0)  
                    < token: generateToken()
                    > update SysAccounts({sysUserId: 1572476377213, token: token});
                    < sysAccount
                < #ENDIF 
                <sent-email: sysAccount.sysUserId, 'Account validation $sysAccount.token'>
                <output: {status: 200, expect: 'wait user input token code'}>
            < #ENDIF 
            > #IF (sysAccount.status == 100) // account enable
                <output: {status: 200, expect: 'Account status enabled'}>
            < #ELSE <output: {status: 400, expect: 'Account status disabled!'}> #ENDELSE  
        )>
+ Account Verification @begin
        <request: data: {sessionData}>
        > query select SysAccounts @by sessionData,user.sysUserId
            < sysAccount
            < accountVerification: accountStatusVerification(sysAccount)
            > #IF (accountVerification.status === 200)
                #IF (accountVerification.expect === 'wait user input token code')
                    /** prepare response **/
                #ENDIF
                #IF (accountVerification.expect === 'Account status enabled')
                    /** prepare response **/
                #ENDIF
                <response: accountVerification.status, accountVerification.expect>
            < #ELSE
                <response: accountVerification.status, accountVerification.expect>
            < #ENDIF

- Api files
    {
        controller: 'SysAccountController',
        services: 'sysServices',
        policies: 'SysPolicy',
        models: ['SysAccounts', 'SysUser', 'SysAppContext', 'SysAccountsStatus', 'SysUserTypes'],
        gitmsg: '[Sys App - account manager 1s commit] [Oscar R.]'
    }
- Tasks
    SignUp: Done. [Sys App - task signup finish] [Oscar R.]
    SignIn: in develepment..
    Account-Verification: in develepment..