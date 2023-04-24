const express = require('express');
const fileUpload = require('express-fileupload');
const DCMFile = require('dcmjs').data.DCMFile;
const hl7 = require('hl7');
const app = express();

const fs = require('fs');
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minuto
    max: 300, // Limite de 3 requisições por minuto
});

app.use(express.json());
app.use(fileUpload());

app.post('/anonimize-dicom', limiter, async (req, res) => {
    try {
        // Verifica se o arquivo DICOM foi enviado
        if (!req.files || !req.files.file) {
            return res.status(400).send('Arquivo DICOM não enviado');
        }

        // Lê o arquivo DICOM enviado
        const file = req.files.file.data;

        // Verifica se o tipo de arquivo enviado é DICOM
        if (!file.slice(0, 4).equals('DICM')) {
            return res.status(400).send('Arquivo não é DICOM');
        }
        // Lê o arquivo DICOM enviado
        // Verifica se o arquivo DICOM é válido
        const dcm = new DCMFile(file);
        if (!dcm) {
            return res.status(400).send('Arquivo DICOM inválido');
        }

        // Verifica se o arquivo DICOM contém informações do paciente
        if (!dcm.getElement('0010', '0010') || !dcm.getElement('0010', '0030') || !dcm.getElement('0010', '0020')) {
            return res.status(400).send('Arquivo DICOM não contém informações do paciente');
        }

        // Anonimiza o nome do paciente
        const name = dcm.getElement('0010', '0010');
        const nameValue = name.value.slice(0, 3) + '*'.repeat(name.value.length - 6) + name.value.slice(-3);
        name.value = nameValue;

        // Anonimiza a data de nascimento do paciente
        const dob = dcm.getElement('0010', '0030');
        const dobValue = dob.value.slice(0, 6) + '*'.repeat(dob.value.length - 6);
        dob.value = dobValue;

        // Anonimiza o número de identificação do paciente
        const id = dcm.getElement('0010', '0020');
        const idValue = '*'.repeat(id.value.length - 4) + id.value.slice(-4);
        id.value = idValue;

        // Anonimiza o nome da mãe do paciente
        const mother = dcm.getElement('0010', '1060');
        mother.value = '*'.repeat(mother.value.length);

        // Anonimiza o endereço do paciente
        const address = dcm.getElement('0038', '0400');
        address.value = '*'.repeat(address.value.length);

        // Anonimiza o telefone do paciente
        const phone = dcm.getElement('0010', '2154');
        phone.value = '*'.repeat(phone.value.length);

        // Retorna o arquivo DICOM anonimizado
        const anonFile = dcm.write();
        res.setHeader('Content-disposition', 'attachment; filename=anon.dcm');
        res.setHeader('Content-type', 'application/dicom');
        res.send(anonFile);
    } catch (err) {
        console.error(err);
        res.status(500).send('Ocorreu um erro durante a anonimização do arquivo DICOM');
    }
});

// Endpoint POST para anonimizar um arquivo HL7
app.post('/anonimize-hl7', limiter, async (req, res) => {
    try {
        // Verificar se foi enviado um arquivo HL7 na requisição
        if (!req.body || !req.body.arquivoHL7) {
            return res.status(400).send({ mensagem: 'Arquivo HL7 não encontrado na requisição.' });
        }

        // Verificar se o arquivo HL7 é uma string válida
        if (typeof req.body.arquivoHL7 !== 'string') {
            return res.status(400).send({ mensagem: 'O arquivo HL7 enviado na requisição é inválido.' });
        }

        // Ler o conteúdo do arquivo HL7 enviado na requisição
        const conteudoHL7 = req.body.arquivoHL7;

        // Converter o conteúdo para objeto HL7
        const parser = new hl7.Parser();
        const mensagemHL7 = parser.parse(conteudoHL7);

        // Verificar se o objeto HL7 é válido
        if (!mensagemHL7) {
            return res.status(400).send({ mensagem: 'O arquivo HL7 enviado na requisição é inválido.' });
        }

        // Anonimizar os dados do paciente na mensagem HL7
        const nomePaciente = mensagemHL7['PID']['5']['1'];
        mensagemHL7['PID']['5']['1'] = `${nomePaciente.substring(0, 3)}${'*'.repeat(nomePaciente.length - 6)}${nomePaciente.substring(nomePaciente.length - 3, nomePaciente.length)}`;
        mensagemHL7['PID']['7'] = '';
        mensagemHL7['PID']['8'][0] = '';
        mensagemHL7['PID']['10'] = '';
        mensagemHL7['PID']['11'] = '';
        mensagemHL7['PID']['19'][0] = '';
        mensagemHL7['PID']['22'] = '';

        // Converter a mensagem HL7 anonimizada para string
        const serializer = new hl7.Serializator();
        const mensagemAnonimizada = serializer.serialize(mensagemHL7);

        // Retornar o arquivo HL7 anonimizado como resposta
        res.setHeader('Content-Disposition', 'attachment; filename=arquivo-anonimizado.hl7');
        res.setHeader('Content-Type', 'application/octet-stream');
        res.send(mensagemAnonimizada);
    } catch (err) {
        console.error(err);
        res.status(500).send('Ocorreu um erro durante a anonimização do arquivo hl7');
    }
});

