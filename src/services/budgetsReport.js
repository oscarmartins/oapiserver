const mongodb = require('mongodb')
const budgetsService = require('./budgets')

function MongoDao(mongoUri, dbname) {
    var _this = this;
    var options = {
        useNewUrlParser: true
    }
    _this.mongoClient = new mongodb.MongoClient(mongoUri, options)
    return new Promise(function(resolve, reject) {
        _this.mongoClient.connect(function(err, client) {
            console.log("mongo client successfully connected \n")
            _this.dbConnection = _this.mongoClient.db(dbname)
            resolve(_this)
        })
    })
}
async function main() {
    const mongoDao = await new MongoDao('mongodb://localhost:27017', 'orcadmin')
    const budgets = mongoDao.dbConnection.collection('budgets')
    //await fillBudget(budgets)
    await sendReport(budgets, new Date('2019-03-24'), new Date('2019-05-01'))
}

main();

async function fillBudget (db) {
    //db.drop();
    const listemails = [{ "_id" : "5c3e543e8d80e6dd6d03fb74", "budgetName" : "Sandra Gomes ", "budgetEmail" : "Sandragomes74@hotmail.com", "budgetMobile" : "965665980", "budgetStreet" : "Rua Vasco Santana ", "budgetPortNumber" : "17", "budgetCity" : "Qta da Seta ", "budgetTipologia" : "", "budgetFloor" : 2, "budgetBedRooms" : "4", "budgetRooms" : "1", "budgetWc" : "3", "budgetArea" : "", "budgetWindows" : null, "budgetObserva" : "", "budgetType" : 20, "budgetDomain" : "orcseven.com", "budgetSeviceType" : "LD", "budgetTipologiaSelect" : "T1", "budgetClientIp" : "::ffff:127.0.0.1", "dateCreated" : "2019-01-15T21:44:30.910Z", "dateUpdated" : "2019-01-15T21:44:30.910Z", "__v" : 0 },
  { "_id" : "5c3f5fe18d80e6dd6d03fb77", "budgetName" : "Marta Moniz", "budgetEmail" : "martamonizz@gmail.com", "budgetMobile" : "927202324", "budgetStreet" : "Estrada do Lumiar ", "budgetPortNumber" : "13", "budgetCity" : "Lisboa ", "budgetTipologia" : "", "budgetFloor" : 1, "budgetBedRooms" : "2", "budgetRooms" : "1", "budgetWc" : "12", "budgetArea" : "115", "budgetWindows" : null, "budgetObserva" : "Boa tarde, \r\n\r\nVenho por este meio fazer um pedido de orçamento para limpeza doméstica regular para um T2 de 115m2 no Lumiar.\r\n\r\nPrecisava de preços para duas modalidades, \r\n\r\n1 vez por semana e de 15 em 15 dias.\r\n\r\nMuito obrigada. \r\nCumprimentos, \r\nMarta", "budgetType" : 20, "budgetDomain" : "orcseven.com", "budgetSeviceType" : "LD", "budgetTipologiaSelect" : "T2", "budgetClientIp" : "::1", "dateCreated" : "2019-01-16T16:46:25.287Z", "dateUpdated" : "2019-01-16T16:46:25.287Z", "__v" : 0 },
  { "_id" : "5c40a6868d80e6dd6d03fb78", "budgetName" : "Diana Guerreiro", "budgetEmail" : "guerreiro.diana@gmail.com", "budgetMobile" : "963 970 739", "budgetStreet" : "Av. Minas Gerais, nº 5 3º esq Figueirinha", "budgetPortNumber" : "5", "budgetCity" : "Oeiras", "budgetTipologia" : "", "budgetFloor" : 1, "budgetBedRooms" : "2", "budgetRooms" : "1", "budgetWc" : "1", "budgetArea" : "86", "budgetWindows" : null, "budgetObserva" : "Boa tarde,\r\n\r\nGostaria de saber o preço de uma limpeza profunda ao apartamento T2 descrito. Nesta  limpeza profunda gostaria de saber se também limpam uma carpete da sala. \r\n\r\nObrigada,", "budgetType" : 20, "budgetDomain" : "orcseven.com", "budgetSeviceType" : "LD", "budgetTipologiaSelect" : "T2", "budgetClientIp" : "::ffff:127.0.0.1", "dateCreated" : "2019-01-17T16:00:06.239Z", "dateUpdated" : "2019-01-17T16:00:06.239Z", "__v" : 0 },
  { "_id" : "5c40a68a8d80e6dd6d03fb79", "budgetName" : "Diana Guerreiro", "budgetEmail" : "guerreiro.diana@gmail.com", "budgetMobile" : "963 970 739", "budgetStreet" : "Av. Minas Gerais, nº 5 3º esq Figueirinha", "budgetPortNumber" : "5", "budgetCity" : "Oeiras", "budgetTipologia" : "", "budgetFloor" : 1, "budgetBedRooms" : "2", "budgetRooms" : "1", "budgetWc" : "1", "budgetArea" : "86", "budgetWindows" : null, "budgetObserva" : "Boa tarde,\r\n\r\nGostaria de saber o preço de uma limpeza profunda ao apartamento T2 descrito. Nesta  limpeza profunda gostaria de saber se também limpam uma carpete da sala. \r\n\r\nObrigada,", "budgetType" : 20, "budgetDomain" : "orcseven.com", "budgetSeviceType" : "LD", "budgetTipologiaSelect" : "T2", "budgetClientIp" : "::1", "dateCreated" : "2019-01-17T16:00:10.454Z", "dateUpdated" : "2019-01-17T16:00:10.454Z", "__v" : 0 },
  { "_id" : "5c41072c8d80e6dd6d03fb7a", "budgetName" : "Marcia Relvas ", "budgetEmail" : "mrelvas1983@gmail.com", "budgetMobile" : "924028029", "budgetStreet" : "Rua vitor damas lote 17 1 C", "budgetPortNumber" : "Lote 17", "budgetCity" : "Amadora", "budgetTipologia" : "Prédio ", "budgetFloor" : 4, "budgetBedRooms" : "", "budgetRooms" : "", "budgetWc" : "", "budgetArea" : "", "budgetWindows" : null, "budgetObserva" : "4 pisos habitacionais. Agradeco que me informem se realizam limpezas a garagens. Pretende se limpeza 1x semana e limpeza de 3 pisos de garagens 2x ano, com maquina.\r\nPor favor resposta por mail", "budgetType" : 20, "budgetDomain" : "orcseven.com", "budgetSeviceType" : "LC", "budgetTipologiaSelect" : "TT", "budgetClientIp" : "::ffff:127.0.0.1", "dateCreated" : "2019-01-17T22:52:28.990Z", "dateUpdated" : "2019-01-17T22:52:28.990Z", "__v" : 0 },
  { "_id" : "5c41072f8d80e6dd6d03fb7b", "budgetName" : "Marcia Relvas ", "budgetEmail" : "mrelvas1983@gmail.com", "budgetMobile" : "924028029", "budgetStreet" : "Rua vitor damas lote 17 1 C", "budgetPortNumber" : "Lote 17", "budgetCity" : "Amadora", "budgetTipologia" : "Prédio ", "budgetFloor" : 4, "budgetBedRooms" : "", "budgetRooms" : "", "budgetWc" : "", "budgetArea" : "", "budgetWindows" : null, "budgetObserva" : "4 pisos habitacionais. Agradeco que me informem se realizam limpezas a garagens. Pretende se limpeza 1x semana e limpeza de 3 pisos de garagens 2x ano, com maquina.\r\nPor favor resposta por mail", "budgetType" : 20, "budgetDomain" : "orcseven.com", "budgetSeviceType" : "LC", "budgetTipologiaSelect" : "TT", "budgetClientIp" : "::1", "dateCreated" : "2019-01-17T22:52:31.004Z", "dateUpdated" : "2019-01-17T22:52:31.004Z", "__v" : 0 },
  { "_id" : "5c4112428d80e6dd6d03fb7c", "budgetName" : "Ana aze8", "budgetEmail" : "Sofia-Azenha@hotmail.com", "budgetMobile" : "965050975", "budgetStreet" : "Vialonga", "budgetPortNumber" : "7", "budgetCity" : "Vialonga", "budgetTipologia" : "", "budgetFloor" : 1, "budgetBedRooms" : "3", "budgetRooms" : "1", "budgetWc" : "2", "budgetArea" : "", "budgetWindows" : null, "budgetObserva" : "", "budgetType" : 20, "budgetDomain" : "orcseven.com", "budgetSeviceType" : "LD", "budgetTipologiaSelect" : "T3", "budgetClientIp" : "::1", "dateCreated" : "2019-01-17T23:39:46.850Z", "dateUpdated" : "2019-01-17T23:39:46.850Z", "__v" : 0 },
  { "_id" : "5c4112468d80e6dd6d03fb7d", "budgetName" : "Ana aze8", "budgetEmail" : "Sofia-Azenha@hotmail.com", "budgetMobile" : "965050975", "budgetStreet" : "Vialonga", "budgetPortNumber" : "7", "budgetCity" : "Vialonga", "budgetTipologia" : "", "budgetFloor" : 1, "budgetBedRooms" : "3", "budgetRooms" : "1", "budgetWc" : "2", "budgetArea" : "", "budgetWindows" : null, "budgetObserva" : "", "budgetType" : 20, "budgetDomain" : "orcseven.com", "budgetSeviceType" : "LD", "budgetTipologiaSelect" : "T3", "budgetClientIp" : "::ffff:127.0.0.1", "dateCreated" : "2019-01-17T23:39:50.855Z", "dateUpdated" : "2019-01-17T23:39:50.855Z", "__v" : 0 },
  { "_id" : "5c41ad5c8d80e6dd6d03fb7e", "budgetName" : "Stela Suils Cuesta", "budgetEmail" : "stelasuils@gmail.com", "budgetMobile" : "911150402", "budgetStreet" : "Rua da Biscaia", "budgetPortNumber" : "392", "budgetCity" : "Biscaia", "budgetTipologia" : "", "budgetFloor" : 2, "budgetBedRooms" : "3", "budgetRooms" : "1", "budgetWc" : "2", "budgetArea" : "", "budgetWindows" : null, "budgetObserva" : "\r\nPor favor, envie um orçamento para uma limpeza semanal e que a mesma pessoa vem cada semana", "budgetType" : 20, "budgetDomain" : "orcseven.com", "budgetSeviceType" : "LD", "budgetTipologiaSelect" : "T3", "budgetClientIp" : "::ffff:127.0.0.1", "dateCreated" : "2019-01-18T10:41:32.881Z", "dateUpdated" : "2019-01-18T10:41:32.881Z", "__v" : 0 },
  { "_id" : "5c41ad608d80e6dd6d03fb7f", "budgetName" : "Stela Suils Cuesta", "budgetEmail" : "stelasuils@gmail.com", "budgetMobile" : "911150402", "budgetStreet" : "Rua da Biscaia", "budgetPortNumber" : "392", "budgetCity" : "Biscaia", "budgetTipologia" : "", "budgetFloor" : 2, "budgetBedRooms" : "3", "budgetRooms" : "1", "budgetWc" : "2", "budgetArea" : "", "budgetWindows" : null, "budgetObserva" : "\r\nPor favor, envie um orçamento para uma limpeza semanal e que a mesma pessoa vem cada semana", "budgetType" : 20, "budgetDomain" : "orcseven.com", "budgetSeviceType" : "LD", "budgetTipologiaSelect" : "T3", "budgetClientIp" : "::1", "dateCreated" : "2019-01-18T10:41:36.781Z", "dateUpdated" : "2019-01-18T10:41:36.781Z", "__v" : 0 },
  { "_id" : "5c45f25e8d80e6dd6d03fb84", "budgetName" : "Carla Branco Pires", "budgetEmail" : "cresende@tnmc.pt", "budgetMobile" : "918389776", "budgetStreet" : "Beloura Office Park Edf.2 Esc.5", "budgetPortNumber" : "2", "budgetCity" : "693", "budgetTipologia" : "escritório", "budgetFloor" : 1, "budgetBedRooms" : "", "budgetRooms" : "", "budgetWc" : "", "budgetArea" : "", "budgetWindows" : null, "budgetObserva" : "Agradecemos orçamento para limpeza de divisórias em vidro de escritório.\r\nObg.", "budgetType" : 20, "budgetDomain" : "orcseven.com", "budgetSeviceType" : "LE", "budgetTipologiaSelect" : "TT", "budgetClientIp" : "::1", "dateCreated" : "2019-01-21T16:25:02.970Z", "dateUpdated" : "2019-01-21T16:25:02.970Z", "__v" : 0 },
  { "_id" : "5c45f2608d80e6dd6d03fb85", "budgetName" : "Carla Branco Pires", "budgetEmail" : "cresende@tnmc.pt", "budgetMobile" : "918389776", "budgetStreet" : "Beloura Office Park Edf.2 Esc.5", "budgetPortNumber" : "2", "budgetCity" : "693", "budgetTipologia" : "escritório", "budgetFloor" : 1, "budgetBedRooms" : "", "budgetRooms" : "", "budgetWc" : "", "budgetArea" : "", "budgetWindows" : null, "budgetObserva" : "Agradecemos orçamento para limpeza de divisórias em vidro de escritório.\r\nObg.", "budgetType" : 20, "budgetDomain" : "orcseven.com", "budgetSeviceType" : "LE", "budgetTipologiaSelect" : "TT", "budgetClientIp" : "::ffff:127.0.0.1", "dateCreated" : "2019-01-21T16:25:04.120Z", "dateUpdated" : "2019-01-21T16:25:04.120Z", "__v" : 0 },
  { "_id" : "5c45f2618d80e6dd6d03fb86", "budgetName" : "Carla Branco Pires", "budgetEmail" : "cresende@tnmc.pt", "budgetMobile" : "918389776", "budgetStreet" : "Beloura Office Park Edf.2 Esc.5", "budgetPortNumber" : "2", "budgetCity" : "693", "budgetTipologia" : "escritório", "budgetFloor" : 1, "budgetBedRooms" : "", "budgetRooms" : "", "budgetWc" : "", "budgetArea" : "", "budgetWindows" : null, "budgetObserva" : "Agradecemos orçamento para limpeza de divisórias em vidro de escritório.\r\nObg.", "budgetType" : 20, "budgetDomain" : "orcseven.com", "budgetSeviceType" : "LE", "budgetTipologiaSelect" : "TT", "budgetClientIp" : "::1", "dateCreated" : "2019-01-21T16:25:05.735Z", "dateUpdated" : "2019-01-21T16:25:05.735Z", "__v" : 0 },
  { "_id" : "5c4af1c98d80e6dd6d03fb89", "budgetName" : "Envialia Portugal S.L. ", "budgetEmail" : "r.lucas@envialia.com", "budgetMobile" : "913139955", "budgetStreet" : "Zona Industrial da Granja , Armazém C6 Vialonga ", "budgetPortNumber" : "C6", "budgetCity" : "Vialonga", "budgetTipologia" : "", "budgetFloor" : 1, "budgetBedRooms" : "", "budgetRooms" : "1", "budgetWc" : "1", "budgetArea" : "", "budgetWindows" : null, "budgetObserva" : "Bom dia , \r\n\r\nVenho por este meio solicitar orçamento para limpeza da nossa plataforma logistica e escritório em Vialonga . \r\n\r\nMelhores cumprimentos,\r\nSaludos,\r\n\r\n \r\nRaul Silva Lucas\r\nResponsável de Desenvolvimento Comercial e Manutenção Portugal\r\n+351 913139955 - Zona Industrial da Granja, Armazém C6 – 2625-717 Vialonga \r\n          \r\n\r\n \r\nEste mensaje se dirige exclusivamente a su destinatario y puede contener información privilegiada o confidencial.\r\nSi no eres el destinatario indicado, queda notificado de que la lectura, utilización, divulgación y/o copia sin autorización está prohibida en virtud de la legislación vigente.\r\nSi has recibido este mensaje por error, te rogamos que nos lo comuniques inmediatamente por esta misma vía y procedas a su destrucción.\r\nEl correo electrónico vía Internet no permite asegurar la confidencialidad de los mensajes que se transmiten ni su integridad o correcta recepción.\r\nEnvialia no asume ninguna responsabilidad por estas circunstancias.\r\n\r\n\r\n", "budgetType" : 20, "budgetDomain" : "orcseven.com", "budgetSeviceType" : "LA", "budgetTipologiaSelect" : "T1", "budgetClientIp" : "::ffff:127.0.0.1", "dateCreated" : "2019-01-25T11:23:53.924Z", "dateUpdated" : "2019-01-25T11:23:53.924Z", "__v" : 0 },
  { "_id" : "5c4ca2758d80e6dd6d03fb8a", "budgetName" : "Mariana ", "budgetEmail" : "bragato.mariana@gmail.com", "budgetMobile" : "913160228", "budgetStreet" : "rua da paz, 10", "budgetPortNumber" : "2 direito", "budgetCity" : "lisboa", "budgetTipologia" : "", "budgetFloor" : 1, "budgetBedRooms" : "3", "budgetRooms" : "2", "budgetWc" : "2", "budgetArea" : "90", "budgetWindows" : null, "budgetObserva" : "", "budgetType" : 20, "budgetDomain" : "orcseven.com", "budgetSeviceType" : "LD", "budgetTipologiaSelect" : "T3", "budgetClientIp" : "::ffff:127.0.0.1", "dateCreated" : "2019-01-26T18:09:57.935Z", "dateUpdated" : "2019-01-26T18:09:57.936Z", "__v" : 0 },
  { "_id" : "5c4cdeca8d80e6dd6d03fb8b", "budgetName" : "Célia Rodrigues", "budgetEmail" : "ccrperdigao@gmail.com", "budgetMobile" : "935122046", "budgetStreet" : "Rua Mario Sottomayor Cardia", "budgetPortNumber" : "14", "budgetCity" : "Loures", "budgetTipologia" : "", "budgetFloor" : 1, "budgetBedRooms" : "2", "budgetRooms" : "1", "budgetWc" : "2", "budgetArea" : "100", "budgetWindows" : null, "budgetObserva" : "", "budgetType" : 20, "budgetDomain" : "orcseven.com", "budgetSeviceType" : "LPM", "budgetTipologiaSelect" : "T2", "budgetClientIp" : "::ffff:127.0.0.1", "dateCreated" : "2019-01-26T22:27:22.326Z", "dateUpdated" : "2019-01-26T22:27:22.326Z", "__v" : 0 },
  { "_id" : "5c4da1e08d80e6dd6d03fb8c", "budgetName" : "MARIA TERESA MAURICIO", "budgetEmail" : "irenemauricio@sapo.pt", "budgetMobile" : "968638078", "budgetStreet" : "RUA", "budgetPortNumber" : ".", "budgetCity" : "LINDA-A-PASTORA", "budgetTipologia" : "", "budgetFloor" : 1, "budgetBedRooms" : "3", "budgetRooms" : "1", "budgetWc" : "1", "budgetArea" : "50", "budgetWindows" : null, "budgetObserva" : "LIMPEZA BISSEMANAL ", "budgetType" : 20, "budgetDomain" : "orcseven.com", "budgetSeviceType" : "LD", "budgetTipologiaSelect" : "T3", "budgetClientIp" : "::ffff:127.0.0.1", "dateCreated" : "2019-01-27T12:19:44.163Z", "dateUpdated" : "2019-01-27T12:19:44.163Z", "__v" : 0 },
  { "_id" : "5c559d778d80e6dd6d03fb8f", "budgetName" : "Ana Santos", "budgetEmail" : "anolas@gmail.com", "budgetMobile" : "967940772", "budgetStreet" : "avenida elias garcia ", "budgetPortNumber" : "17", "budgetCity" : "Lisboa", "budgetTipologia" : "", "budgetFloor" : 1, "budgetBedRooms" : "2", "budgetRooms" : "1", "budgetWc" : "2", "budgetArea" : "70", "budgetWindows" : null, "budgetObserva" : "", "budgetType" : 20, "budgetDomain" : "orcseven.com", "budgetSeviceType" : "LD", "budgetTipologiaSelect" : "T2", "budgetClientIp" : "::ffff:127.0.0.1", "dateCreated" : "2019-02-02T13:39:03.325Z", "dateUpdated" : "2019-02-02T13:39:03.325Z", "__v" : 0 },
  { "_id" : "5c57054d8d80e6dd6d03fb91", "budgetName" : "Luísa Mascarenhas", "budgetEmail" : "mascarenhas.mluisa@gmail.com", "budgetMobile" : "916 010 366", "budgetStreet" : "Avenida Grão Vasco", "budgetPortNumber" : "31", "budgetCity" : "Lisboa", "budgetTipologia" : "", "budgetFloor" : 1, "budgetBedRooms" : "2", "budgetRooms" : "1", "budgetWc" : "1", "budgetArea" : "70 ", "budgetWindows" : null, "budgetObserva" : "Limpeza de paredes com fungos.", "budgetType" : 20, "budgetDomain" : "orcseven.com", "budgetSeviceType" : "LD", "budgetTipologiaSelect" : "T2", "budgetClientIp" : "::1", "dateCreated" : "2019-02-03T15:14:21.857Z", "dateUpdated" : "2019-02-03T15:14:21.857Z", "__v" : 0 },
  { "_id" : "5c59f6448d80e6dd6d03fb92", "budgetName" : "Vera Costa", "budgetEmail" : "vera.dinis.costa@gmail.com", "budgetMobile" : "351932878284", "budgetStreet" : "Estrada de benfica", "budgetPortNumber" : "472", "budgetCity" : "Lisboa", "budgetTipologia" : "", "budgetFloor" : 1, "budgetBedRooms" : "2", "budgetRooms" : "1", "budgetWc" : "2", "budgetArea" : "", "budgetWindows" : null, "budgetObserva" : "Boa noite,\r\nPretendo obter orçamento para serviço de limpeza doméstica, 2xsemana (2f e 6f). À 2f seria para engomar roupa + arrumação e limpeza de 2WC e kitchenette e à 6f uma limpeza mais \"profunda\" de todas as divisões. É uma casa com 2 quartos, 2 WC, sala, kitchenette, marquise e varanda.", "budgetType" : 20, "budgetDomain" : "orcseven.com", "budgetSeviceType" : "LD", "budgetTipologiaSelect" : "T2", "budgetClientIp" : "::ffff:127.0.0.1", "dateCreated" : "2019-02-05T20:47:00.280Z", "dateUpdated" : "2019-02-05T20:47:00.280Z", "__v" : 0 },
  { "_id" : "5c59f6458d80e6dd6d03fb93", "budgetName" : "Vera Costa", "budgetEmail" : "vera.dinis.costa@gmail.com", "budgetMobile" : "351932878284", "budgetStreet" : "Estrada de benfica", "budgetPortNumber" : "472", "budgetCity" : "Lisboa", "budgetTipologia" : "", "budgetFloor" : 1, "budgetBedRooms" : "2", "budgetRooms" : "1", "budgetWc" : "2", "budgetArea" : "", "budgetWindows" : null, "budgetObserva" : "Boa noite,\r\nPretendo obter orçamento para serviço de limpeza doméstica, 2xsemana (2f e 6f). À 2f seria para engomar roupa + arrumação e limpeza de 2WC e kitchenette e à 6f uma limpeza mais \"profunda\" de todas as divisões. É uma casa com 2 quartos, 2 WC, sala, kitchenette, marquise e varanda.", "budgetType" : 20, "budgetDomain" : "orcseven.com", "budgetSeviceType" : "LD", "budgetTipologiaSelect" : "T2", "budgetClientIp" : "::1", "dateCreated" : "2019-02-05T20:47:01.987Z", "dateUpdated" : "2019-02-05T20:47:01.987Z", "__v" : 0 },
  { "_id" : "5c5a0f618d80e6dd6d03fb94", "budgetName" : "maria", "budgetEmail" : "majoaoalvesserra@gmail.com", "budgetMobile" : "21212121212", "budgetStreet" : "oeiras", "budgetPortNumber" : "2", "budgetCity" : "0eiras", "budgetTipologia" : "", "budgetFloor" : 1, "budgetBedRooms" : "2", "budgetRooms" : "1", "budgetWc" : "1", "budgetArea" : "100", "budgetWindows" : null, "budgetObserva" : "", "budgetType" : 20, "budgetDomain" : "orcseven.com", "budgetSeviceType" : "LD", "budgetTipologiaSelect" : "T2", "budgetClientIp" : "::ffff:127.0.0.1", "dateCreated" : "2019-02-05T22:34:09.212Z", "dateUpdated" : "2019-02-05T22:34:09.212Z", "__v" : 0 },
  { "_id" : "5c5a0f658d80e6dd6d03fb95", "budgetName" : "maria", "budgetEmail" : "majoaoalvesserra@gmail.com", "budgetMobile" : "21212121212", "budgetStreet" : "oeiras", "budgetPortNumber" : "2", "budgetCity" : "0eiras", "budgetTipologia" : "", "budgetFloor" : 1, "budgetBedRooms" : "2", "budgetRooms" : "1", "budgetWc" : "1", "budgetArea" : "100", "budgetWindows" : null, "budgetObserva" : "", "budgetType" : 20, "budgetDomain" : "orcseven.com", "budgetSeviceType" : "LD", "budgetTipologiaSelect" : "T2", "budgetClientIp" : "::1", "dateCreated" : "2019-02-05T22:34:13.783Z", "dateUpdated" : "2019-02-05T22:34:13.783Z", "__v" : 0 },
  { "_id" : "5c5ad4678d80e6dd6d03fb97", "budgetName" : "Raquel Lamy", "budgetEmail" : "lamy.ana.raquel@gmail.com", "budgetMobile" : "965713832", "budgetStreet" : "Arruda dos vinhos", "budgetPortNumber" : ".", "budgetCity" : ".", "budgetTipologia" : "Quinta ", "budgetFloor" : 0, "budgetBedRooms" : "0", "budgetRooms" : "0", "budgetWc" : "0", "budgetArea" : ".", "budgetWindows" : null, "budgetObserva" : "Boa tarde,\r\nPretendo orçamento para limpeza profunda, higienizar ao máximo uma Quinta em Arruda dos Vinhos que em tempos esteve a funcionar.\r\nSerão 6 divisões, em que 3 têm mais ou menos 118m2, outra tem 220m2 e as outras duas devem ter cerca de 60m2.\r\n\r\nObrigada,\r\n", "budgetType" : 20, "budgetDomain" : "orcseven.com", "budgetSeviceType" : "LD", "budgetTipologiaSelect" : "TT", "budgetClientIp" : "::1", "dateCreated" : "2019-02-06T12:34:47.429Z", "dateUpdated" : "2019-02-06T12:34:47.429Z", "__v" : 0 },
  { "_id" : "5c5ad4698d80e6dd6d03fb98", "budgetName" : "Raquel Lamy", "budgetEmail" : "lamy.ana.raquel@gmail.com", "budgetMobile" : "965713832", "budgetStreet" : "Arruda dos vinhos", "budgetPortNumber" : ".", "budgetCity" : ".", "budgetTipologia" : "Quinta ", "budgetFloor" : 0, "budgetBedRooms" : "0", "budgetRooms" : "0", "budgetWc" : "0", "budgetArea" : ".", "budgetWindows" : null, "budgetObserva" : "Boa tarde,\r\nPretendo orçamento para limpeza profunda, higienizar ao máximo uma Quinta em Arruda dos Vinhos que em tempos esteve a funcionar.\r\nSerão 6 divisões, em que 3 têm mais ou menos 118m2, outra tem 220m2 e as outras duas devem ter cerca de 60m2.\r\n\r\nObrigada,\r\n", "budgetType" : 20, "budgetDomain" : "orcseven.com", "budgetSeviceType" : "LD", "budgetTipologiaSelect" : "TT", "budgetClientIp" : "::ffff:127.0.0.1", "dateCreated" : "2019-02-06T12:34:49.629Z", "dateUpdated" : "2019-02-06T12:34:49.629Z", "__v" : 0 },
  { "_id" : "5c5b54438d80e6dd6d03fb9b", "budgetName" : "OSCAR MARTINS", "budgetEmail" : "oscarrafaelcampos@gmail.com", "budgetMobile" : "913859014", "budgetStreet" : "ALAMEDA DA GUIA, N 192 - 4F", "budgetPortNumber" : "0", "budgetCity" : "CASCAIS", "budgetTipologia" : "", "budgetFloor" : 0, "budgetBedRooms" : "0", "budgetRooms" : "0", "budgetWc" : "0", "budgetArea" : "0", "budgetWindows" : null, "budgetObserva" : "Teste fómulario", "budgetType" : 20, "budgetDomain" : "orcseven.com", "budgetSeviceType" : "LD", "budgetTipologiaSelect" : "T1", "budgetClientIp" : "::1", "dateCreated" : "2019-02-06T21:40:19.086Z", "dateUpdated" : "2019-02-06T21:40:19.086Z", "__v" : 0 },
  { "_id" : "5c5b54468d80e6dd6d03fb9c", "budgetName" : "OSCAR MARTINS", "budgetEmail" : "oscarrafaelcampos@gmail.com", "budgetMobile" : "913859014", "budgetStreet" : "ALAMEDA DA GUIA, N 192 - 4F", "budgetPortNumber" : "0", "budgetCity" : "CASCAIS", "budgetTipologia" : "", "budgetFloor" : 0, "budgetBedRooms" : "0", "budgetRooms" : "0", "budgetWc" : "0", "budgetArea" : "0", "budgetWindows" : null, "budgetObserva" : "Teste fómulario", "budgetType" : 20, "budgetDomain" : "orcseven.com", "budgetSeviceType" : "LD", "budgetTipologiaSelect" : "T1", "budgetClientIp" : "::ffff:127.0.0.1", "dateCreated" : "2019-02-06T21:40:22.309Z", "dateUpdated" : "2019-02-06T21:40:22.309Z", "__v" : 0 },
  { "_id" : "5c5b55e08d80e6dd6d03fb9e", "budgetName" : "Judith Santos ", "budgetEmail" : "Judithsantosco28@gmail.com", "budgetMobile" : "927027717", "budgetStreet" : "Praça Bento Gonçalves ", "budgetPortNumber" : "3", "budgetCity" : "Vialinga", "budgetTipologia" : "", "budgetFloor" : 5, "budgetBedRooms" : "6", "budgetRooms" : "3", "budgetWc" : "4", "budgetArea" : "", "budgetWindows" : null, "budgetObserva" : "", "budgetType" : 20, "budgetDomain" : "orcseven.com", "budgetSeviceType" : "LD", "budgetTipologiaSelect" : "T2", "budgetClientIp" : "::ffff:127.0.0.1", "dateCreated" : "2019-02-06T21:47:12.163Z", "dateUpdated" : "2019-02-06T21:47:12.163Z", "__v" : 0 }];

    var filter = []
    for (var e = 0; e < listemails.length; e++) {
        var doc = listemails[e]
        if (filter.indexOf(doc.budgetEmail) >= 0) {
            continue
        } 
        filter.push(doc.budgetEmail)     
        db.insertOne(doc, function(err, res) {
            if (err) throw err
            console.log(res.insertedId)         
        });
    }
}

async function sendReport (db, begin, end) {   
    let query = {dateCreated: { $gt: begin, $lt: end}}
    db.find(query).toArray(function(err, result) {
        if (err) throw err
        for (let u = 0; u < result.length; u++) {
            console.log(`send budget (since ${begin} to ${end}) / ${result[u].budgetEmail} - ${result[u].dateCreated}`)
        }
        budgetsService.sendEmailOndemand(result)
    })  
}

async function createTransport() {
    return nodemailer.createTransport({
      host: 'smtp-pt.securemail.pro',
      //port: emailsafecleanpt.port,
      //secure: emailsafecleanpt.secure, // true for 465, false for other ports
      port: 465,
      secure: true,
      auth: {
        user: emailsafecleanpt.user, // generated ethereal user
        pass: emailsafecleanpt.pass // generated ethereal password
      }
    })
}

async function alternativeSendemail () {

    const nodemailer = require('nodemailer')
    const emailsafecleanpt = require('/opt/orccontext')['email_safeclean_pt']

    let message = {
        to: 'geral@safeclean.pt',
        subject: 'teste local',
        html: 'teste local'
    };

    let transporter = await createTransport().then(function(tporter){
        if (tporter) {
          message.from = emailsafecleanpt.user
          return tporter.sendMail(message).then(function (info) {
            var log = `Message sent: ${info.messageId} - `
            log += `Preview URL: ${nodemailer.getTestMessageUrl(info)}`
            console.log(log)
            return log
          }).catch(function (error) {
            let maillogerror = '*** email error logger ***\n'       
            maillogerror += error
            maillogerror += '\n'
            maillogerror += 'message= ' + JSON.stringify(message)
            console.log(maillogerror)
            return error
          })
        } else {
          return  console.log('nada a fazer')
        }   
    }).catch(function (err) {
        console.log(err)
        return err
    })
}

