const {standblog} = require('../models')
const resultOutput = require('../utils/Utils')['resultOutput']
let outobj = {}
/**
    pubName:"Nome"
    pubMarca:"Marca"
    
    pubAC:"Ar"
    pubAnoRegisto:"2018"
    pubCilindrada:"Colidranda"
    pubColor:"Cor"
    pubCombustivel:"gasolina"
    pubCondStatus:"condNew"
    pubCreateDate:"September 17, 2018"
    pubLotacao:"Lotacao"
    
    pubMesRegisto:"03"
    pubModelo:"Modelo"
    
    pubNPorts:"N portas"
    pubPotencia:"Potencia"
    pubQuilometros:"Quilometros"
    pubStand:"Stand"
    pubVersao:"Versao"
    pubGalery: []
    published: false
                 */
async function _save (param) {
    if (!param.pubName) {
        return resultOutput.resultOutputError('O campo nome deve estar preenchido!!!')
    } else {
        const model = new standblog(param)
        model.dateCreated = Date.now()
        model.dateUpdated = Date.now()      
        const result = await model.save().then(async function (doc) {
            return resultOutput.resultOutputSuccess('A publicação foi registada com sucesso!')
        }).catch(function (err) {
            console.log(err)
            return resultOutput.resultOutputDataError(err)
        });
        return result
    }
}
async function _saveAndPublish (param) {
    param.published = true;
    const result = await _save(param)
    return result
}
async function _fetchAll () {
    return outobj
}
const instance = {
    save: _save,
    saveAndPublish: _saveAndPublish,
    fetchAll: _fetchAll
}

module.exports = instance
