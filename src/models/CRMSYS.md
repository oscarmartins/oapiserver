CRM | USERSGROUPS, USER

variable reference: groupid

1. resgister new user 
1.1 relation as groupid

    CRMUSERSGROUPS : {
        namegroup, groupid, status
    }
    CRMUSER : {
        name, email, secret, groupid
    }

    new CRMUSERSGROUPS('admin', '999000', '1');
    new CRMUSERSGROUPS('guest', '6767676', '1');
    new CRMUSERSGROUPS('user', '100000', '1');
    
    new CRMUSER('Oscar', 'oscar@gmail.com', '123456', 100000);
    new CRMUSER('Melissa', 'mel@gmail.com', '123456', 999000);

    


2. 