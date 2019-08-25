const tofile = require('fs');
const masterwords = ['limpeza', 'limpezas'];
const headerwords = ['', 
'residencial', 
'residenciais', 
'condomínio', 
'condomínios', 
'pós obra', 
'pós-obra', 
'pós obras', 
'pós-obra', 
'escritório', 
'escritórios', 
'doméstica',
'domésticas'
];
const keyswords = [
    '',
    'cascais',
    'estoril',
    'lisboa',
    'amadora',
    'sintra',
    'alcabideche',
    'estoril',
    'oeiras',
    'carcavelos',
    'parede',
    'alamada',
    'alvalade',
    'benfica',
    'rio de mouro',
    'mem martins',
    'algueirão - mem martins',
    'são marcos',
    'carnaxide',
    'linda-a-velha',
    'odivelas',
    'mafra',
    'agualva-cacém',
    'algés',
    'colares',
    'praia do guincho'];

function main () {
    let phrases = [];
    for (let i = 0; i < masterwords.length; i++) {
       for (let q = 0; q < headerwords.length; q++) {
            for (let e = 0; e < keyswords.length; e++) {
                let sp1 =  headerwords[q] === '' ? '' : ' ' ;
                let sp2 = keyswords[e] === '' ? '' : ' ' ;
                if (sp1 === sp2 && (sp1 === '' && sp2 === ''))
                    continue;
                let w = masterwords[i] + sp1 + headerwords[q]  + sp2 + keyswords[e];
                phrases.push(w);
            }
        }
    }
    phrases.forEach(function (words) {
        console.log(words);
    });
    tofile.WriteStream(tofile.)
}

setTimeout(main, 0);