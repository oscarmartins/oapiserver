/== todo ==/
== Models:
    User
    Accounts

== New Models:
    AUXDB : {
       AUXNAME: {type: string,required: true,unique: false},
       AUXKEY: {type: string,required: true,unique: true},
       AUXVALUE: {type: string,required: false,unique: false}
   }

    >>e.g: 
        AUXDB("COUNTRY", "351", "Portugal")

        ·AUXDB("USER_RULE", "1000", "Admin")
        ··AUXDB("USER_RULE", "500", "User")
        ····AUXDB("USER_RULE", "501", "SubUser")
        ·AUXDB("USER_RULE", "100", "Guest")

== Models Changes

    model.User << ( Add ) -- (User.rule_code) 

== New Logic
    >> To implement
        1 oper.signup - create new user code rule 100 (guest)
        2 oper.signin - query by user rule ( >= 500 )

== Backoffice 
    ‹N› " Se o registo novo utilizador sem utilizador registado, o registo fica com a regra de utilizador igual a Guest.
          Se o registo novo utilizador com utilizador registado tipo 1000, o registo fica com a regra utilizador igual a User.
          Se o registo novo utilizador com utilizador registado tipo 500, o registo fica com a regra utilizador igual a SubUser.
          Se o registo novo utilizador com utilizador registado tipo 501, nao é possivel efectuar o registo.  
        "
    >> User Account Manager

    == Todo Grids Database browser Models 
    ‹N› " indicar end point para pesquisa geral; parametro com flag 'model_name' "

    ::    server option: all models <=> query model bu name return all records!!
    
        



