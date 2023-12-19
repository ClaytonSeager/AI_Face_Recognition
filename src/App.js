import './App.css';
import Navigation from './components/Navigation/Navigation.js';
import Logo from './components/Logo/Logo.js';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm.js';
import Rank from './components/Rank/Rank.js';
import ParticlesBg from 'particles-bg';
import React from 'react';
import FaceRecognition from './components/FaceRecognition/FaceRecognition.js'
import SignIn from './components/SignIn/SignIn.js';
import Register from './components/Register/Register';

class App extends React.Component {
    constructor() {
        super();
        this.state = {
            input: '',
            imageUrl: '',
            box: {
            },
            route: 'signin',
            isSignedIn: false,
        }
    }

    calculateFaceLocation = (data) => {
        const boundingBox = data.outputs[0].data.regions[0].region_info.bounding_box;
        const image = document.querySelector("#inputImage");
        const width = Number(image.width);
        const height = Number(image.height);
        return {
            leftCol: boundingBox.left_col * width,
            topRow: boundingBox.top_row * height,
            rightCol: width - (boundingBox.right_col * width),
            bottomRow: height - (boundingBox.bottom_row * height),
        }
    }

    displayFaceBox = (box) => {
        this.setState({box: box})
    }

    onInputChange = (event) => {
        this.setState({input: event.target.value});
    }

    onButtonSubmit = ()=> {
        this.setState({imageUrl: this.state.input})
        const PAT = '18596d847895478d9b6733203db7cb82';
        const USER_ID = 'claytonseager';
        const APP_ID = 'cms-smart-brain-project-2023';
        const MODEL_ID = 'face-detection';
        const MODEL_VERSION_ID = '6dc7e46bc9124c5c8824be4822abe105';
        const IMAGE_URL = this.state.input;

        const raw = JSON.stringify({
            "user_app_id": {
                "user_id": USER_ID,
                "app_id": APP_ID
            },
            "inputs": [
                {
                    "data": {
                        "image": {
                            "url": IMAGE_URL
                        }
                    }
                }
            ]
        });

        const requestOptions = {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Authorization': 'Key ' + PAT
            },
            body: raw
        };

        fetch("https://api.clarifai.com/v2/models/" + MODEL_ID + "/versions/" + MODEL_VERSION_ID + "/outputs", requestOptions)
            .then(response => response.json())
            .then(result => this.displayFaceBox(this.calculateFaceLocation(result)))
            .catch(error => console.log('error', error));
    }

    onRouteChange = (route) => {
        if (route === 'signout') {
            this.setState({isSignedIn: false})
        } else if (route === 'home') {
            this.setState({isSignedIn: true});
        }
        this.setState({route: route});
    }

    render() {
        const { isSignedIn, imageUrl, route, box } = this.state;
        return (
            <div className="App">
                <ParticlesBg type="cobweb" num={150} bg={true} />
                <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange}/>
                { route === 'home'
                    ? <div>
                        <Logo/>
                        <Rank/>
                        <ImageLinkForm onInputChange={this.onInputChange}
                                       onButtonSubmit={this.onButtonSubmit}/>
                        <FaceRecognition box={box} imageUrl={imageUrl}/>
                    </div>
                    : (
                        route === 'signin'
                            ? <SignIn onRouteChange={this.onRouteChange}/>
                            : <Register onRouteChange={this.onRouteChange}/>
                    )
                }
            </div>
        );
    }
}

export default App;


/*

Clarifai Notes
Create an App on Clarifai and get the API Key in App Settings and paste the key in "apiKey" object property
IF we get a Model Does Not exist error, onButtonSubmit uses predict and has changed to use the new Model ID for the model we are wanting to use

 */
