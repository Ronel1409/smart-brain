import React, { Component } from 'react'
import './App.css';
import Navigation from './components/Navigation/Navigation';
import Facerecognition from './components/Facerecognition/Facerecognition';
import Logo from './components/Logo/Logo';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import Particles from 'react-particles-js'


const particlesOptions = {
  particles: {
    number: {
      value: 30,
      density: {
        enable: true,
        value_area: 800
      }
    }
  }
}

const initialState = {
    input: '',
    imageURL: '',
    box: '',
    route: 'signin',
    isSignedin: false,
    user : {
      id: '',
      name: '',
      entries: 0,
      joined: ''
    }
  }

class App extends Component {
  constructor() {
    super()
    this.state = initialState
  }

  loadUser = (data) => {
    this.setState({user: {
      id: data.id,
      name: data.name,
      entries: data.entries,
      joined: data.joined
    }})
  }

  componentDidMount() {
    fetch('http://localhost:3001')
    .then(response => response.json())
    .then(console.log)
  }

  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);

    return {
      leftCol: clarifaiFace.left_col * width,
      topCol: clarifaiFace.top_col * height,
      rightCol: width (clarifaiFace.right_col * width),
      bottomRow: height (clarifaiFace.bottom_row * height)
    }
  }

  displayFaceBox = (box) => {
    this.setState({ box: box });
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value});
  }

  onButtonSubmit = () => {
    this.state({imageURL: this.state.input});
    fetch('http://localhost:3001/imageurl', {
      method: 'post',
      headers : { 'Content-Type': 'application/json' },
      body: JSON.stringify({
          input: this.state.user.input
      })
  })
  .then(response => response.json())
    .then(response => {
      if (response) {
        fetch('http://localhost:3001/image', {
          method: 'put',
          headers : { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              id: this.state.user.id
          })
      })
      .then(response => response.json())
      .then(count => {
        this.setState(Object.assign(this.state.user, {
          entries: count
        }))
      })
      .catch(console.log)
    }
      this.displayFaceBox(this.calculateFaceLocation(response))
  })
    .catch(err => console.log(err));
  }

  onRouteChange = (route) => {
    if (route === 'signout') {
      this.setState(initialState)
    } else if (route === 'home') {
      this.setState({isSignedin: true})
    } 
    this.setState({route: route});
  }

  render() {
    const {isSignedin, imageURL, route, box} = this.state
    return (
      <div className="App">
          <Particles className="particles" 
          params={{particlesOptions}}/>
        <Navigation isSignedin={isSignedin} onRouteChange={this.onRouteChange}/>
        {
          route === 'home'
          ? <div>
           <Logo/>
          <Rank
          name = {this.state.user.name}
          entries = {this.state.user.entries}
          />
          <ImageLinkForm 
          onInputChange={this.onInputChange} 
          onButtonSubmit={ this.onButtonSubmit }/>
          <Facerecognition box={ box } imageURL={ imageURL }/>
        </div>
        : (
        route === 'signin'
        ? <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange}/> 
        : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
         )
        }
       </div>
      );  
  }
}

export default App;
