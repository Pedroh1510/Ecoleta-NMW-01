import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { Link, useHistory } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { Map, TileLayer, Marker } from "react-leaflet";
import { LeafletMouseEvent } from "leaflet";
import axios from 'axios'
import * as yup from 'yup'

import './styles.css';

import logo from "../../assets/logo.svg";

import api from '../../services/api'
import Dropzone from '../../components/Dropzone'

interface Item{
  id:number
  title:string
  image_url:string
}
interface IBGECityResponse{
  nome:string
}

interface IBGEUfResponse{
  sigla:string
}
const pointSchema = yup.object().shape({
  name: yup.string().required(),
  email:yup.string().required(),
  whatsapp:yup.string().required(),
  latitude:yup.number().required().test({
    test:(value:number)=>{
      return String(value).length>=3
    }
  }),
  longitude:yup.number().required().test({
    test:(value:number)=>{
      return String(value).length>=3
    }
  }),
  uf:yup.string().required(),
  city:yup.string().required(),
  items:yup.array().required()
})

const CreatePoint: React.FC = () => {
  const [items, setItems] = useState<Item[]>([])
  const [ufs, setUfs] = useState<string[]>([])
  const [cities, setCities] = useState<string[]>([])
  const [selectedPosition, setSelectedPosition] = useState<[number,number]>([0,0])

  const [inicialPosition, setInicialPosition] = useState<[number,number]>([0,0])

  const [selectedFile, setSelectedFile] = useState<File>()
  const [selectedUf, setSelectedUf] = useState('0')
  const [selectedCity, setSelectedCity] = useState('0')
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [formData, setFormData]=useState({
    name:'',
    email:'',
    whatsapp:''
  })

  const histoty = useHistory()

  useEffect(()=>{
    api.get('items').then(response=>{
      setItems(response.data)
    })
  },[])

  useEffect(()=>{
    axios.get<IBGEUfResponse[]>("https://servicodados.ibge.gov.br/api/v1/localidades/estados").then( response=>{
      const ufInitials = response.data.map(uf=>uf.sigla)

      setUfs(ufInitials.sort())
    })
  },[])

  useEffect(()=>{
    if(selectedUf === '0'){
      return
    }
    axios
      .get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`)
      .then(response=>{
        const cityNames = response.data.map(city=>city.nome)
        setCities(cityNames)
      })
  },[selectedUf])

  useEffect(()=>{
    navigator.geolocation.getCurrentPosition(position=>{
      const {latitude, longitude} = position.coords
      setInicialPosition([latitude,longitude])
    })
  },[])

  function handleSelectedUf(event: ChangeEvent<HTMLSelectElement>){    
    setSelectedUf(event.target.value)
  }

  function handleSelectedCity(event: ChangeEvent<HTMLSelectElement>){    
    setSelectedCity(event.target.value)
  }

  function handleMapClick(event: LeafletMouseEvent){
    setSelectedPosition([event.latlng.lat,event.latlng.lng])
  }
  
  function handleInputChenge(event: ChangeEvent<HTMLInputElement>){
    const {name, value}= event.target
    setFormData({...formData, [name]:value})
  }

  function handleSelectedItem(id: number){
    if(selectedItems.includes(id)){
      const filteredItems = selectedItems.filter(itemId=>itemId!==id)
      setSelectedItems(filteredItems)
    }
    else{
      setSelectedItems([...selectedItems, id])
    }
  }

  async function handleSubmit(event: FormEvent){
    event.preventDefault()

    const {name, email, whatsapp} = formData
    const uf = selectedUf
    const city = selectedCity
    const [latitude, longitude] = selectedPosition
    const items = selectedItems

    const pointForm={
      name,
      email,
      whatsapp,
      uf,
      city,
      latitude,
      longitude,
      items
    }
    const valid = await pointSchema.isValid(pointForm)
    
    const data = new FormData()
    
    data.append('name',name)
    data.append('email',email)
    data.append('whatsapp',whatsapp)
    data.append('uf',uf)
    data.append('city',city)
    data.append('latitude',String(latitude))
    data.append('longitude',String(longitude))
    data.append('items',items.join(','))
    
    if(selectedFile){
      data.append('image',selectedFile)
    }
    
    if(!valid){
      alert('Oooops. Necessario preencher todo o formulario')
      return null
    }

    api.post('points',data)
    alert('Cadastro concluido')
    histoty.push('/')
  }

  return (
    <div id="page-create-point">
      <header>
        <img src={logo} alt="Ecoleta"/>
        <Link to="/">
          <FiArrowLeft/>
          Voltar para home
        </Link>
      </header>
      <form onSubmit={handleSubmit}>
        <h1>Cadastro do <br/>ponto de coleta</h1>

        <Dropzone onFileUploaded={setSelectedFile}/>

        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>
          <div className="field">
            <label htmlFor="name">Nome da entidade</label>
            <input 
              type="text"
              name="name"
              id="name"
              onChange={handleInputChenge}
            />
          </div>

          <div className="field-group">
            <div className="field">
              <label htmlFor="email">E-mail</label>
              <input 
                type="email"
                name="email"
                id="email"
                onChange={handleInputChenge}
              />
            </div>

            <div className="field">
              <label htmlFor="whatsapp">Whatsapp</label>
              <input 
                type="text"
                name="whatsapp"
                id="whatsapp"
                onChange={handleInputChenge}
              />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Endereços</h2>
            <span>Selecione um endereço no mapa</span>
          </legend>

          <Map center={inicialPosition} zoom={15} onClick={handleMapClick}>
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />  

            <Marker position={selectedPosition}/>
          </Map>

          <div className="field-group">
            <div className="field">
              <label htmlFor="uf">Estado (UF)</label>
              <select name="uf" id="uf" onChange={handleSelectedUf}>
                <option value="0">Selecione uma UF</option>
                {ufs.map(uf=>(
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="city">Cidade</label>
              <select name="city" id="city" onChange={handleSelectedCity}>
                <option value="0">Selecione uma cidade</option>
                {cities.map(city=>(
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Items de coleta</h2>
            <span>Selecione um ou mais itens abaixo</span>
          </legend>

          <ul className="items-grid">
            {items.map(item=>(
              <li 
                key={item.id} 
                onClick={()=>handleSelectedItem(item.id)}
                className={selectedItems.includes(item.id)?'selected':''}
                >
                <img src={item.image_url} alt="item.title"/>
                <span>{item.title}</span>
              </li>
            ))}
          </ul>
        </fieldset>

        <button 
          type="submit"
        >
          Cadastrar ponto de coleta
        </button>
      </form>
    </div>
    );
}

export default CreatePoint;