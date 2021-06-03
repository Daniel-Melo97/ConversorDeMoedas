import api from './service/api';
import apiKey from './service/apiKey';
import React, {useState, useEffect} from 'react';
import ReactFlagsSelect from 'react-flags-select';
import {Form, Container, Row, Card} from 'react-bootstrap';


export default function App() {


  const [labels, setLabels] = useState();//labels do campo de seleção dos paises
  const [paises, setPaises] = useState([]); //todos os paises
  const [selected, setSelected] = useState(''); //auxiliar na seleção da moeda do país de origem
  const [selectedDest, setSelectedDest] = useState(''); //auxiliar na seleção da moeda do país de destino

  const [moedaDestino, setMoedaDestino] = useState(''); //moeda de destino
  const [moeda, setMoeda] = useState(''); //moeda de origem

  const [valor , setValor] = useState(''); //valor da moeda de origem
  const [convertido, setConvertido] = useState(''); //valor convertido para moeda destino

  var mensagem = <h1 className="text-center">Selecione as moedas e informe o valor que deseja converter</h1>; //mensagem padrão para quando nenhuma requisição foi feita

  useEffect(() => {// traz a lista de países com suas respectivas moedas
    api.get(`/countries?apiKey=${apiKey}`)
      .then(response =>{
        let newPaises = []
        for (var key in response.data.results) {
          if (response.data.results.hasOwnProperty(key)) {
              newPaises.push(response.data.results[key])
          }
        }
        let newLabels = {};
        newPaises.forEach(moeda => { 
          newLabels[moeda.id] = moeda.currencyName;//criar json no formato sigla do país: nome da moeda, exemplo: BR: Brazilian real
        });

        setLabels(newLabels); 
        setPaises(newPaises); //todos os países com as informações necessárias
      })
  }, []);


  useEffect(() => { // se os 3 valores estiverem preenchidos, ele busca o valor para calcular
    async function calcular(){// realiza a busca na api e calcula o valor convertido
      await api.get(`/convert?q=${moeda}_${moedaDestino}&compact=ultra&apiKey=${apiKey}`).then(response =>{
        let proporcao = response.data[`${moeda}_${moedaDestino}`];
  
        let valordot =  valor.replace(",",".");//trocando vírgula por ponto, caso exista, para que a conversão para float não dê erro
        let valor_float = parseFloat(valordot);
        let resultado = proporcao * valor_float; //multplica valor da moeda origem pela proporção da moeda destino
  
        setConvertido(resultado);
      })
    }

    if(valor !== '' && moeda !== '' && moedaDestino !== ''){//só realiza a busca na api se todos estiverem com algum valor
      const timeOutId = setTimeout(() => calcular(), 500); //espera um tempo depois que o usuário para de digitar para realizar a requisição
      return () => clearTimeout(timeOutId);      //limpa o timeout
    }
  }, [valor, moeda, moedaDestino]);

  function handleSelectDest(code){ //seta valor para moeda destino
    let element = paises.find(moeda =>{
      return moeda.id === code
    });

    setMoedaDestino(element.currencyId);
    setSelectedDest(code);
  }

  function handleSelect(code){// seta valor para moeda de origem
    let element = paises.find(moeda =>{
      return moeda.id === code
    });

    setMoeda(element.currencyId);
    setSelected(code);
  }

  function handleValor(numero){ //seta valor para o valor em dinheiro da moeda origem

    setValor(numero);
  
    if(convertido !== '' && numero === ''){//se o usuário apagar tudo e o valor convertido estiver setado, zeramos o valor convertido também
      setConvertido('');
    }
  }


  if(convertido !== ''){// se houver algum valor dentro de convertido, ele exibirá a mensagem mostrando o valor convertido para a moeda desejada
    mensagem = <Card>
                <Card.Body>
                  <Card.Title>{valor} {moeda} em {moedaDestino} valem:</Card.Title>
                  <Card.Text>
                    {convertido} {moedaDestino}
                  </Card.Text>
                </Card.Body>
              </Card>
  }

  function noSubmit(event){//impedir que form realize hard refresh se o usuário apertar enter
    event.preventDefault();
  }


  
  return (
    <Container className="justify-content-center my-5 bg-light p-5">
      <Row>     
        <Form onSubmit={noSubmit} className="mb-5">
            
            <Form.Group controlId="moeda_origem">
            <Form.Label className="mt-2">Moeda de origem</Form.Label>
              <ReactFlagsSelect
                placeholder="Selecione uma moeda"
                selected={selected}
                onSelect={code => handleSelect(code)}
                countries={paises.map(moeda => { return moeda.id})}
                customLabels={labels}
                searchable
                className="bg-white"
              />
            </Form.Group>
              <Form.Label className="mt-2" >Valor a ser convertido</Form.Label>
              <Form.Group  controlId="valor">
              <Form.Control
                type="text"
                placeholder="Valor"
                value={valor}
                onChange={event => handleValor(event.target.value)}
                 
              />
            </Form.Group>
        
            <Form.Group controlId="moeda_destino" className="mt-2" >
              <Form.Label className="mt-2">Moeda de destino</Form.Label>
              <ReactFlagsSelect
                placeholder="Selecione uma moeda"
                selected={selectedDest}
                onSelect={code => handleSelectDest(code)}
                countries={paises.map(moeda => { return moeda.id})}
                customLabels={labels}
                searchable
                className="bg-white"
              />

            </Form.Group>
        </Form>
      </Row>
      <Row>
        {mensagem}
      </Row>
    </Container>
  );
}
