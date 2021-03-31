import React from 'react';
import SchoolIcon from '@material-ui/icons/School';
import StarIcon from '@material-ui/icons/Star';
import './App.css';
import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import ResponsiveEmbed  from 'react-responsive-embed';
import moment from 'moment'
import quote from './quote';
import Loader from 'react-loader-spinner';
import soundfile from './mysong.mp3'
import ParticlesBg from "particles-bg";
class App extends React.Component {
  audio = new Audio(soundfile)
  constructor(props) {
    super(props);
    this.state = {
      data : []
    }
  }

  componentDidMount(){
    const proxyurl = "https://cors-anywhere.herokuapp.com/";
    var apiUrl = 'https://thisismyvoiceapi.rabbitboy.me/thisismyvoice';
    fetch(proxyurl + apiUrl)
      .then(response => response.json())
      .then(data => {
        this.setState({
          data: data
        })
      });
    
    // this.audio.play();
    this.audio.addEventListener('ended', () =>  this.audio.play());
  }

  componentWillUnmount() {
    this.audio.removeEventListener('ended', () =>  this.audio.pause());  
  }

  radomColor(){
    return Math.floor(Math.random() * Math.floor(250));
  }

  getQuote(){
    let randomIndex = Math.floor(Math.random() * Math.floor(quote.quotes.length-1))
    return quote.quotes[randomIndex].quote;
  }
  

  Voice(){
    return (
      <VerticalTimeline>
              {
                this.state.data.map((data, index) => {
                  return (
                    <VerticalTimelineElement
                      className="vertical-timeline-element--work"
                      contentStyle={{ background: `rgb(${this.radomColor()}, ${this.radomColor()}, ${this.radomColor()})`, color: index%2==0 ? "#000" : '#FFF' }}
                      contentArrowStyle={{ borderRight: '7px solid  rgb(33, 150, 243)' }}
                      date={moment(data.createdTime).format('ddd MMMM Do YYYY, h:mm:ss a')+' -- '+moment(data.createdTime).startOf('day').fromNow()}
                      iconStyle={{ background: 'rgb(33, 150, 243)', color: '#fff' }}
                      icon={<SchoolIcon />}
                    >
                      <ResponsiveEmbed src={`${data.webViewLink.replace("/view", "/preview")}`} ratio='4:3'  allowFullScreen />
                      <h3 className="vertical-timeline-element-title">Title : {data.name.split('.')[0]}</h3>
                      <h4 className="vertical-timeline-element-subtitle">Owner : {data.owners[0].displayName}</h4>
                      <p>
                        {this.getQuote()}
                      </p>
                    </VerticalTimelineElement>
                  )
                })
              }

              <VerticalTimelineElement
                iconStyle={{ background: 'rgb(16, 204, 82)', color: '#fff' }}
                icon={<StarIcon />}
              />
          </VerticalTimeline>
    )
  }

  Spinner(){
    return (
      <Loader
         style={{alignSelf: 'center'}}
         type="Ball-Triangle"
         color="#00BFFF"
         height={200}
         width={200}
         timeout={100000} //3 secs
      />
    )
  }
  render() {
    return (
      <div style={{
      alignContent:'center',display:'flex',
      flex:1,flexDirection:'column',height: this.state.data.length==0  ? '100vh' :'auto',justifyContent:'center'}}>
        <ParticlesBg type="random" bg={true}/>
        <h1 style={{textAlign:"center",color:`rgb(${this.radomColor()}, ${this.radomColor()}, ${this.radomColor()})`}}>♥️នេះគឺជាសម្លេងរបស់ខ្ញុំក្នុងសាលារៀន KSHRD♥️</h1>
        {
          this.state.data.length===0 ? this.Spinner() : this.Voice()
        }
        
      </div>
    );
  }

}

export default App;
