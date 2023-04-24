# "AnonMedIm" - uma abreviação criativa para "Anonymization of Medical Image files".
**Uma API de Anonimização de Dados de Paciente em Arquivos HL7 e DICOM**

Esta API tem como objetivo receber arquivos no formato HL7 ou DICOM contendo informações de pacientes e realizar a anonimização desses dados, respeitando as diretrizes da Lei Geral de Proteção de Dados (LGPD).

## A API possui dois métodos principais:

- POST /anonimizar-hl7: Recebe um arquivo HL7 no corpo da requisição, realiza a anonimização dos dados do paciente e retorna o arquivo anonimizado para download.
- POST /anonimizar-dicom: Recebe um arquivo DICOM no corpo da requisição, realiza a anonimização dos dados do paciente e retorna o arquivo anonimizado para download.

Ambos os métodos seguem o mesmo fluxo: primeiro, é verificado se o arquivo foi enviado corretamente na requisição. Em seguida, o arquivo é lido e convertido para um objeto HL7 ou DICOM, dependendo do método utilizado. Os dados do paciente são então anonimizados, seguindo as diretrizes estabelecidas. Por fim, o arquivo anonimizado é retornado como resposta para download.
Além disso, a API também possui um limite de 3 requisições por minuto para evitar sobrecarga do servidor.

Para utilizar a API, basta fazer uma requisição POST para a URL correspondente ao método desejado, enviando o arquivo a ser anonimizado no corpo da requisição. Caso a requisição seja bem-sucedida, o arquivo anonimizado será retornado como resposta, pronto para download.

**Exemplo de requisição utilizando o método /anonimizar-hl7:**

```sh
POST http://localhost:3000/anonimizar-hl7

Corpo da requisição:
{
    "arquivoHL7": "conteúdo do arquivo HL7"
}
```
**Resposta:**
O arquivo HL7 anonimizado será retornado como download.

**Exemplo de requisição utilizando o método /anonimizar-dicom:**
```sh
POST http://localhost:3000/anonimizar-dicom

Corpo da requisição:
{
    "arquivoDICOM": "conteúdo do arquivo DICOM"
}
```

**Resposta:**
O arquivo DICOM anonimizado será retornado como download.
Lembre-se de respeitar o limite de 300 requisições por minuto para evitar bloqueios ou sobrecarga do servidor.

** Exemplos de consumo da API em PHP para o arquivo DICOM**
```sh
<?php

// Caminho para o arquivo DICOM a ser anonimizado
$filePath = 'caminho/para/arquivo.dcm';

// URL da API
$url = 'http://exemplo.com/anonimize-dicom';

// Cria um objeto cURL
$curl = curl_init();

// Configura as opções do cURL
curl_setopt_array($curl, array(
    CURLOPT_URL => $url,
    CURLOPT_POST => 1,
    CURLOPT_POSTFIELDS => array(
        'file' => curl_file_create($filePath),
    ),
    CURLOPT_RETURNTRANSFER => 1,
));

// Executa a requisição
$response = curl_exec($curl);

// Verifica se ocorreu algum erro
if (curl_errno($curl)) {
    echo 'Erro ao realizar a requisição: ' . curl_error($curl);
    exit;
}

// Verifica o código de status da resposta
$status = curl_getinfo($curl, CURLINFO_HTTP_CODE);
if ($status != 200) {
    echo 'Erro ao anonimizar o arquivo DICOM: código de status ' . $status;
    exit;
}

// Salva o arquivo DICOM anonimizado em disco
$anonFilePath = 'caminho/para/arquivo-anonimizado.dcm';
file_put_contents($anonFilePath, $response);

// Fecha a conexão cURL
curl_close($curl);

echo 'Arquivo DICOM anonimizado salvo em: ' . $anonFilePath;

?>
```

** Exemplos de consumo da API em PHP para o arquivo HL7**
```sh

<?php

// Caminho para o arquivo HL7 a ser anonimizado
$filePath = 'caminho/para/arquivo.hl7';

// Conteúdo do arquivo HL7
$fileContent = file_get_contents($filePath);

// URL da API
$url = 'http://exemplo.com/anonimizar-hl7';

// Cria um objeto cURL
$curl = curl_init();

// Configura as opções do cURL
curl_setopt_array($curl, array(
    CURLOPT_URL => $url,
    CURLOPT_POST => 1,
    CURLOPT_POSTFIELDS => array(
        'arquivoHL7' => $fileContent,
    ),
    CURLOPT_RETURNTRANSFER => 1,
));

// Executa a requisição
$response = curl_exec($curl);

// Verifica se ocorreu algum erro
if (curl_errno($curl)) {
    echo 'Erro ao realizar a requisição: ' . curl_error($curl);
    exit;
}

// Verifica o código de status da resposta
$status = curl_getinfo($curl, CURLINFO_HTTP_CODE);
if ($status != 200) {
    echo 'Erro ao anonimizar o arquivo HL7: código de status ' . $status;
    exit;
}

// Salva o arquivo HL7 anonimizado em disco
$anonFilePath = 'caminho/para/arquivo-anonimizado.hl7';
file_put_contents($anonFilePath, $response);

// Fecha a conexão cURL
curl_close($curl);

echo 'Arquivo HL7 anonimizado salvo em: ' . $anonFilePath;

?>
```
## Contribuidores
Este projeto foi desenvolvido por:
- Djunio Rosa de Melo FIlho

# General Public License:

The code is under the [GNU GPL v3](https://www.gnu.org/licenses/gpl-3.0.html), so you can be feel free to study and contribute.

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.