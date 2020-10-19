const axios = require('axios');
const xmlToJs = require('xml-js');
const convOpts = { compact: true, ignoreComment: true, spaces: 4 };

module.exports = {
    GnreLoteRecepcao: async (data, emitente, cert) => {
        try {
            let xml = `
                <soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:gnr="http://www.gnre.pe.gov.br/webservice/GnreLoteRecepcao">            
                <soap:Header>
                    <gnr:gnreCabecMsg>
                        <gnr:versaoDados>2.00</gnr:versaoDados>
                    </gnr:gnreCabecMsg>
                </soap:Header>
                <soap:Body>
                    <gnr:gnreDadosMsg>
                        <TLote_GNRE versao="2.00" xmlns="http://www.gnre.pe.gov.br">
                            <guias>`

            for (i = 0; i < data.length; i++) {
                xml += await geraLoteUf(data[i], emitente)
            }
            xml += `        </guias>
                        </TLote_GNRE>
                    </gnr:gnreDadosMsg>
                </soap:Body>
            </soap:Envelope>`

            xml = xml.replace(/\n|\r|\t/g, "").replace(/(  )/g, '');

            let result = await axios.post('https://www.testegnre.pe.gov.br/gnreWS/services/GnreLoteRecepcao', xml, {
                headers: {
                    'Content-Type': 'text/xml;charset=UTF-8',
                    'soapAction': 'http://www.gnre.pe.gov.br/webservice/GnreLoteRecepcao/processar',
                },
                httpsAgent: cert
            })

            var { data } = result
            let resp = data.replace(/[:]|(  )/g, '')
            let conv = xmlToJs.xml2js(resp, convOpts) // Converte 

            var { ns1recibo, ns1situacaoRecepcao } = conv.soapenvEnvelope.soapenvBody.processarResponse.ns1TRetLote_GNRE

            if (ns1situacaoRecepcao.ns1codigo._text != '100') {
                msgErro = ns1situacaoRecepcao.ns1descricao._text
                statusErro = ns1situacaoRecepcao.ns1codigo._text

                return { status: statusErro, msg: msgErro }
            } else {
                numLote = ns1recibo.ns1numero._text

                return { status: 'OK', msg: numLote }
            }
        } catch (e) {
            console.log(`Erro geração de lote -> + ${e}`)

            return { status: 'ERR', msg: `Erro axios.post -> ${e}` }
        }
    },

    GnreResultadoLote: async (data) => {
        let xml

        try {
            xml = `
            <env:Envelope xmlns:env="http://www.w3.org/2003/05/soap-envelope">
                <env:Header>
                    <gnreCabecMsg
                        xmlns="http://www.gnre.pe.gov.br/webservice/GnreResultadoLote">
                        <versaoDados>2.00</versaoDados>
                    </gnreCabecMsg>
                </env:Header>
                <env:Body>
                    <gnreDadosMsg xmlns="http://www.gnre.pe.gov.br/webservice/GnreResultadoLote">                    
                        <TConsLote_GNRE xmlns="http://www.gnre.pe.gov.br">
                            <ambiente>2</ambiente>
                            <numeroRecibo>${data.msg}</numeroRecibo>
                        </TConsLote_GNRE>                    
                    </gnreDadosMsg>
                </env:Body>
            </env:Envelope>
            `
            // Loop 5 vezes aguardando resposta do portal GNRE caso o resultado venha como "Lote em processamento"
            for (i = 0; i < 5; i++) {
                let result = await axios.post('https://www.testegnre.pe.gov.br/gnreWS/services/GnreResultadoLote', xml, {
                    headers: {
                        'Content-Type': 'text/xml;charset=UTF-8',
                        'soapAction': 'http://www.gnre.pe.gov.br/webservice/GnreLoteRecepcao/consultar',
                    },
                    httpsAgent: agent
                })

                var { data } = result
                let resp = data.replace(/[:]|(  )/g, '')
                let conv = xmlToJs.xml2js(resp, convOpts) // Converte 

                var { ns1resultado, ns1situacaoProcess } = conv.soapenvEnvelope.soapenvBody.gnreRespostaMsg.ns1TResultLote_GNRE

                let ret = ns1situacaoProcess.ns1descricao._text == 'Lote em processamento' ? false : true;

                ret == true ? i += 5 : setTimeout(() => { }, 5000);
            }

            if (ns1situacaoProcess.ns1codigo._text != '402') {
                msgErro = ns1situacaoProcess.ns1descricao._text
                statusErro = ns1situacaoProcess.ns1codigo._text


                return { status: statusErro, msg: msgErro, motivo: ns1resultado.ns1guia.ns1motivosRejeicao }
            } else if (ns1situacaoProcess.ns1codigo._text == '402') {
                numLote = ns1recibo.ns1numero._text

                return { status: `OK`, msg: numLote }
            } else {
                console.log(`Lote ${numLote} ainda em processamento, não foi possivel efetuar consulta`)
                return { status: `ERR`, msg: `Lote ${numLote} ainda em processamento, não foi possivel efetuar consulta` }
            }
        } catch (e) {
            console.log(`Erro ao consultar Lote -> ${e}`)

            return { status: `ERR`, msg: `Erro ao consultar Lote -> ${e}` }
        }
    }
}

/**
 * Função de geração do corpo do XML de acordo com a UF a ser recebida
 * @param {Json Object} data 
 */
async function geraLoteUf(data, emitente) {
    var {
        CNPJEmitente,
        razaoSocialEmitente,
        enderecoEmitente,
        municipioEmitente,
        ufEmitente
    } = emitente

    var {
        ufFavorecida,
        tipoGnre,
        receita,
        detalhamentoReceita,
        documentoOrigem,
        produto,
        referencia,
        dataVencimento,
        valorPrincipal,
        destinatario,
        valorGnre,
        dataPagamento,
        identificadorGuia,
        camposExtras
    } = data

    xml = `
    <TDadosGNRE versao="2.00">
        <ufFavorecida>${ufFavorecida}</ufFavorecida>
        <tipoGnre>${tipoGnre}</tipoGnre>
        <contribuinteEmitente>
        <identificacao>
        <CNPJ>${CNPJEmitente}</CNPJ>
        </identificacao>
        <razaoSocial>${parseXml(razaoSocialEmitente)}</razaoSocial>
        <endereco>${parseXml(enderecoEmitente)}</endereco>
        <municipio>${municipioEmitente}</municipio>
        <uf>${ufEmitente}</uf>
        </contribuinteEmitente>

        <itensGNRE>
        <item>
            <receita>${receita}</receita>`

    if (detalhamentoReceita) {
        xml += `<detalhamentoReceita>${detalhamentoReceita}</detalhamentoReceita>`
    }
    if (documentoOrigem) {
        xml += `<documentoOrigem tipo="${documentoOrigem.tipo}">${documentoOrigem.valor}</documentoOrigem>`
    }
    if (produto) {
        xml += `<produto>${produto}</produto>`
    }
    if (referencia) {
        xml += `<referencia>`
        xml += referencia.periodo ? `<periodo>${referencia.periodo}</periodo>` : ``
        xml += referencia.mes ? `<mes>${referencia.mes}</mes>` : ``
        xml += referencia.ano ? `<ano>${referencia.ano}</ano>` : ``
        xml += referencia.parcela ? `<parcela>${referencia.parcela}</parcela>` : ``
        xml += `</referencia>`
    }
    xml += `<dataVencimento>${dataVencimento}</dataVencimento>`
    if (valorPrincipal) {
        xml += `<valor tipo="${valorPrincipal.tipo}">${valorPrincipal.valor}</valor>`
    }
    if (destinatario) {
        xml += `<contribuinteDestinatario>`
        xml += `<identificacao>`
        xml += destinatario.cpf ? `<CPF>${destinatario.cpf}</CPF>` : ``
        xml += destinatario.cnpj ? `<CNPJ>${destinatario.cnpj}</CNPJ>` : ``
        xml += `</identificacao>`
        xml += `<razaoSocial>${parseXml(destinatario.razaoSocial)}</razaoSocial>`
        xml += `<municipio>${destinatario.municipio}</municipio>`
        xml += `</contribuinteDestinatario>`
    }

    if (camposExtras) {
        xml += `<camposExtras>`
        for (i = 0; i < camposExtras.length; i++) {
            xml += `
            <campoExtra>
                <codigo>${camposExtras[i].tipo}</codigo>
                <valor>${camposExtras[i].valor}</valor>
            </campoExtra>`
        }
        xml += `</camposExtras>`
    }

    xml += `
            </item>
        </itensGNRE>
        <valorGNRE>${valorGnre}</valorGNRE>
        <dataPagamento>${dataPagamento}</dataPagamento>
        <identificadorGuia>${identificadorGuia}</identificadorGuia>
    </TDadosGNRE>`

    return xml
}

/**
 * Função de parse de campo xml para substituir caracteres 
 * @param {string} str 
 */
function parseXml(str) {
    // Substitui os sinais: '&' '<' '>' '"' ''', a substituicao do simbolo & tem que ser feita no inicio dos replaces.
    str = str.replace(/(&)/g, '&amp;').replace(/(<)/g, '&lt;').replace(/(>)/g, '&gt;').replace(/(")/g, '&quot;').replace(/(')/g, '&#39;');

    return str
}