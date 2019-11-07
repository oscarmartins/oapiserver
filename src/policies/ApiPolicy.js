const OPTIONS = {
  NEW_CODE_VALIDATION: 100,
  INVALIDATE_CODE_VALIDATION: -100,
  KEEP_CODE_VALIDATION: 200,
  SIGNUP: 1000,
  SIGNIN: 2000,
  ACCOUNT_VERIFY: 3000,
  ACCOUNT_RECOVERY: 4000,
  ACCOUNT_RECOVERY_EMAIL: 4010,
  ACCOUNT_RECOVERY_CODE: 4020,
  ACCOUNT_RECOVERY_RESET: 4030,
  ACCOUNT_RECOVERY_RESUME: 40102030,
  NEW_SIGNUP: 1010,
  ON_SIGNIN: 2010,
  ON_SIGNOUT: 2020,
  accountValid: 101010,
  onAccountValidation: 10000,
  onAccountValidationCode: 11000,
  onPasswordRecovery: 20000,
  onPasswordRecoveryCode: 21000,
  onPasswordRecoveryChange: 22000,
  CHECKACCOUNTSTATUS: 5000,
  onCheckAccountStatus: 5010,
  onGenerateAccountCode: 5020,
  onValidateAccountCode: 5030,
  backoffice: 123321,
  backoffice_hardReset: 66666666,
  backoffice_removeAccount: 66667777,
  CUSTOMER_PROFILE: 6000,
  onFetchCustomerProfile: 6010,
  onUpdateCustomerProfile: 6020,
  ORC_API: 7007,
  fetchApiPolicy: 7017,
  services: {
    root: 996699,
    budgetsRequest: 1000,
    w2ui: 9999,
    paluticars: 155015,
    crmsys: 202020,
    sysapp: 606060
  },
  EMAIL_MANAGER:{
    fetchProfiles: 2018706100,
    retrieveProfileById: 2018706200,
    new: 2018706300,
    update: 2018706400,
    remove: 2018706500
  },
  crmsys: {
    sidebar: 10100,
    addUserGroup: 11100,
    allUserGroup: 11200
  },
  sysapp: {
    signup: 60100,
    signin: 60200,
    accountverification: 60300,
    seedauxmodels: 60400,
    requestaccountverificationtoken: 60500,
    accountrecovery: 60600
  }
}

module.exports = OPTIONS
