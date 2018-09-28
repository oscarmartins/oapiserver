const {Standblog} = require('../models')
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
    } else if (!param.pubGalery || !param.pubGalery.length) {
        return resultOutput.resultOutputError('Deve inserir uma foto!!')
    } else {
        const model = new Standblog(param)
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
async function _fetchAll (param) {
    const testfind = await Standblog.find({}).then((doc) => {
        return doc
    }).catch(function (err) {
        console.log(err)
        return resultOutput.resultOutputDataError(err)
    });  

    return resultOutput.resultOutputDataOk(testfind)
}
async function _deleteById (param){
    let msg = '';
    try {
        if (param && param.id) {
            const testfind = await Standblog.findOneAndRemove({_id: param.id}).then((doc) => {
                return doc
            }).catch(function (err) {
                console.log(err)
                return resultOutput.resultOutputDataError(err)
            });
            if (testfind) {
                msg = 'a publicação foi eleminada com sucesso!'
            } else {
                throw 'erro ao remover a publicação _id: ' + param.id
            }
        } else {
            throw 'sem parametros'
        }
    } catch (error) {
        return resultOutput.resultOutputError(error)
    }
    return resultOutput.resultOutputSuccess(msg)
}
async function _publishedById (param){
    let msg = '';
    try {
        if (param && param.id) {
            const published = param.SUBVALUE || false
            const testfind = await Standblog.findByIdAndUpdate(param.id, {$set: {published: published}}, { new: true }).then((doc) => {
                return doc
            }).catch(function (err) {
                console.log(err)
                return resultOutput.resultOutputDataError(err)
            });
            if (testfind) {
                msg = 'a publicação foi actualizada com sucesso!'
            } else {
                throw 'erro ao actualizar a publicação _id: ' + param.id
            }
        } else {
            throw 'sem parametros'
        }
    } catch (error) {
        return resultOutput.resultOutputError(error)
    }
    return resultOutput.resultOutputSuccess(msg)
}
async function _findById (param) {
    try {
        if (param && param.id) {
            const testfind = await Standblog.findById(param.id).then((doc) => {
                return doc
            }).catch(function (err) {
                console.log(err)
                return resultOutput.resultOutputDataError(err)
            });
            if (testfind) {
                let tmp = resultOutput.resultOutputDataOk(testfind)
                return tmp
            } else {
                throw 'erro ao procurar a publicação com _id: ' + param.id
            }
        } else {
            throw 'sem parametros'
        }
    } catch (error) {
        return resultOutput.resultOutputError(error)
    }
}
const instance = {
    save: _save,
    saveAndPublish: _saveAndPublish,
    fetchAll: _fetchAll,
    deleteById: _deleteById,
    publishedById: _publishedById,
    findById: _findById
}

module.exports = instance
