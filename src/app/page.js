"use client";
import React, { Component } from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import SchoolIcon from "@material-ui/icons/School";
import StarIcon from "@material-ui/icons/Star";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import PauseIcon from "@material-ui/icons/Pause";
import VolumeUpIcon from "@material-ui/icons/VolumeUp";
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";
import moment from "moment";
import quote from "./quote";
import Loader from "react-loader-spinner";
import LazyEmbed from './LazyEmbed'

// Dynamically import ParticlesBg - disabled on mobile for performance
const ParticlesBg = dynamic(() => import("particles-bg"), { 
  ssr: false,
  loading: () => null
});

// Constants for performance optimization
const ITEMS_PER_PAGE = 15;

class HomePage extends Component {
  constructor(props) {
    super(props);
    
    // Pre-generate colors to avoid repeated calculations
    this.colorCache = this.generateColorCache(100);
    this.quoteCache = this.generateQuoteCache(100);
    
    this.state = {
      data: [],
      displayedItems: ITEMS_PER_PAGE,
      audioLoaded: false,
      audioReady: false,
      isPlaying: false,
      showPlayButton: true,
      loading: true,
      isLoadingMore: false,
      isMobile: false,
    };
    this.audioRef = null;
    this.timelineRef = React.createRef();
  }

  componentDidMount() {
    // Detect mobile device
    this.detectMobile();
    
    // Load audio
    this.loadAudio();

    // Fetch data
    this.fetchData();

    // Add scroll listener for infinite loading
    window.addEventListener('scroll', this.handleScroll);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
    
    if (this.audioRef) {
      this.audioRef.removeEventListener("ended", this.handleAudioEnd);
      this.audioRef.removeEventListener("loadeddata", this.handleAudioLoaded);
      this.audioRef.removeEventListener("error", this.handleAudioError);
      this.audioRef.removeEventListener("play", this.handleAudioPlay);
      this.audioRef.removeEventListener("pause", this.handleAudioPause);
      this.audioRef.pause();
      this.audioRef.src = "";
    }
  }

  detectMobile = () => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
      || window.innerWidth <= 768;
    this.setState({ isMobile });
  };

  // Pre-generate colors to avoid repeated random calculations
  generateColorCache = (count) => {
    const colors = [];
    for (let i = 0; i < count; i++) {
      colors.push({
        r: Math.floor(Math.random() * 250),
        g: Math.floor(Math.random() * 250),
        b: Math.floor(Math.random() * 250)
      });
    }
    return colors;
  };

  // Pre-generate quotes to avoid repeated random selections
  generateQuoteCache = (count) => {
    const quotes = [];
    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * quote.quotes.length);
      quotes.push(quote.quotes[randomIndex].quote);
    }
    return quotes;
  };

  // Throttle utility function
  throttle = (func, limit) => {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    }
  };

  // Throttled scroll handler for infinite loading
  handleScroll = this.throttle(() => {
    if (this.state.isLoadingMore || this.state.displayedItems >= this.state.data.length) {
      return;
    }

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    if (scrollTop + windowHeight >= documentHeight - 1000) {
      this.loadMoreItems();
    }
  }, 100);

  loadMoreItems = () => {
    this.setState({ isLoadingMore: true });
    
    // Simulate loading delay for UX
    setTimeout(() => {
      this.setState(prevState => ({
        displayedItems: Math.min(
          prevState.displayedItems + ITEMS_PER_PAGE,
          prevState.data.length
        ),
        isLoadingMore: false
      }));
    }, 300);
  };

  loadAudio = () => {
    try {
      this.audioRef = new Audio("/mysong.mp3");

      // Bind event handlers
      this.audioRef.addEventListener("ended", this.handleAudioEnd);
      this.audioRef.addEventListener("loadeddata", this.handleAudioLoaded);
      this.audioRef.addEventListener("error", this.handleAudioError);
      this.audioRef.addEventListener("play", this.handleAudioPlay);
      this.audioRef.addEventListener("pause", this.handleAudioPause);
    } catch (error) {
      console.log("Audio loading failed:", error);
    }
  };

  handleAudioLoaded = () => {
    console.log("Audio loaded successfully");
    this.setState({
      audioLoaded: true,
      audioReady: true,
    });
  };

  handleAudioError = (e) => {
    console.error("Audio failed to load:", e);
    this.setState({ audioLoaded: false, audioReady: false });
  };

  handleAudioPlay = () => {
    this.setState({ isPlaying: true });
  };

  handleAudioPause = () => {
    this.setState({ isPlaying: false });
  };

  handleAudioEnd = () => {
    if (this.audioRef) {
      this.audioRef.currentTime = 0;
      this.audioRef.play().catch(console.error);
    }
  };

  handlePlayAudio = async () => {
    if (!this.audioRef || !this.state.audioReady) {
      console.log("Audio not ready");
      return;
    }

    try {
      if (this.state.isPlaying) {
        this.audioRef.pause();
      } else {
        await this.audioRef.play();
        this.setState({ showPlayButton: false });
      }
    } catch (error) {
      console.error("Play failed:", error);
    }
  };

  fetchData = async () => {
    try {
      const response = await fetch("/api/minio/list");
      const data = await response.json();
      if (data.success) {
        // Sort files by date extracted from filename (newest first)
        const sortedData = data.objects.sort((a, b) => {
          const dateA = this.extractDateFromFilename(a.name) || new Date(a.lastModified);
          const dateB = this.extractDateFromFilename(b.name) || new Date(b.lastModified);
          return dateB - dateA;
        });

        this.setState({ data: sortedData, loading: false });
      } else {
        console.error("Failed to fetch data:", data.error);
        this.setState({ loading: false });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      this.setState({ loading: false });
    }
  };

  // Use cached colors instead of generating random colors each time
  getColor(index) {
    return this.colorCache[index % this.colorCache.length];
  }

  // Use cached quotes instead of generating random quotes each time
  getQuote(index) {
    return this.quoteCache[index % this.quoteCache.length];
  }

  extractDateFromFilename(filename) {
    const dateMatch = filename.match(/^(\d{8})/);
    if (dateMatch) {
      const dateStr = dateMatch[1];
      const year = dateStr.substring(0, 4);
      const month = dateStr.substring(4, 6);
      const day = dateStr.substring(6, 8);
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    return null;
  }

  renderAudioControls() {
    const { audioReady, isPlaying, showPlayButton } = this.state;

    if (!audioReady) {
      return (
        <div style={styles.audioControl}>
          <VolumeUpIcon style={{ marginRight: 8 }} />
          <span>Loading audio...</span>
        </div>
      );
    }

    if (showPlayButton || !isPlaying) {
      return (
        <button
          style={styles.audioButton}
          onClick={this.handlePlayAudio}
          disabled={!audioReady}
        >
          {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
          <span style={{ marginLeft: 8 }}>
            {isPlaying ? "Pause" : "Play"}
          </span>
        </button>
      );
    }

    return (
      <div style={styles.audioControl}>
        <VolumeUpIcon style={{ marginRight: 8 }} />
        <span>Playing...</span>
        <button style={styles.smallButton} onClick={this.handlePlayAudio}>
          <PauseIcon />
        </button>
      </div>
    );
  }

  renderVoiceTimeline() {
    const { data, displayedItems, isLoadingMore } = this.state;
    const itemsToShow = data.slice(0, displayedItems);

    return (
      <>
        <VerticalTimeline ref={this.timelineRef}>
          {itemsToShow.map((item, index) => {
            const fileDate = this.extractDateFromFilename(item.name) || new Date(item.lastModified);
            const color = this.getColor(index);
            
            return (
              <VerticalTimelineElement
                key={`${item.name}-${index}`} // More stable key
                className="vertical-timeline-element--work"
                contentStyle={{
                  background: `rgb(${color.r}, ${color.g}, ${color.b})`,
                  color: index % 2 === 0 ? "#000" : "#FFF",
                }}
                contentArrowStyle={{ borderRight: "7px solid rgb(33, 150, 243)" }}
                date={
                  moment(fileDate).format("ddd MMMM Do YYYY, h:mm:ss a") +
                  " -- " +
                  moment(fileDate).startOf("day").fromNow()
                }
                iconStyle={{ background: "rgb(33, 150, 243)", color: "#fff" }}
                icon={<SchoolIcon />}
              >
                <LazyEmbed
                  src={item.url || item.publicUrl || `/api/minio/file/${item.name}`}
                  contentType={item.contentType}
                  ratio="16:9" // Better mobile ratio
                />
                <h3 className="vertical-timeline-element-title">
                  Title: {item.name.split(".")[0]}
                </h3>
                <h4 className="vertical-timeline-element-subtitle">
                  Size: {(item.size / 1024 / 1024).toFixed(2)} MB
                </h4>
                <p>{this.getQuote(index)}</p>
              </VerticalTimelineElement>
            );
          })}
          
          {isLoadingMore && (
            <VerticalTimelineElement
              iconStyle={{ background: "rgb(255, 165, 0)", color: "#fff" }}
              icon={<div style={{ fontSize: '12px' }}>...</div>}
            >
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <Loader
                  type="TailSpin"
                  color="#00BFFF"
                  height={40}
                  width={40}
                />
                <p>Loading more items...</p>
              </div>
            </VerticalTimelineElement>
          )}
          
          <VerticalTimelineElement
            iconStyle={{ background: "rgb(16, 204, 82)", color: "#fff" }}
            icon={<StarIcon />}
          />
        </VerticalTimeline>

        {displayedItems < data.length && !isLoadingMore && (
          <div style={styles.loadMoreContainer}>
            <button style={styles.loadMoreButton} onClick={this.loadMoreItems}>
              Load More ({data.length - displayedItems} remaining)
            </button>
          </div>
        )}
      </>
    );
  }

  renderSpinner() {
    return (
      <Loader
        style={{ alignSelf: "center" }}
        type="Ball-Triangle"
        color="#00BFFF"
        height={200}
        width={200}
        timeout={100000}
      />
    );
  }

  render() {
    const { loading, isMobile } = this.state;
    
    return (
      <>
        <Head>
          <title>This Is My Voice - KSHRD</title>
          <meta
            name="description"
            content="នេះគឺជាសម្លេងរបស់ខ្ញុំក្នុងសាលារៀន KSHRD"
          />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <div
          style={{
            alignContent: "center",
            display: "flex",
            flex: 1,
            flexDirection: "column",
            height: loading ? "100vh" : "auto",
            justifyContent: "center",
          }}
        >
          {/* Background particles - disabled on mobile for performance */}
          {!isMobile && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                zIndex: -1,
              }}
            >
              <ParticlesBg type="random" bg={true} />
            </div>
          )}

          {/* Mobile-friendly gradient background */}
          {isMobile && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                zIndex: -1,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              }}
            />
          )}

          {/* Audio controls */}
          <div style={isMobile ? styles.mobileAudioContainer : styles.audioControlContainer}>
            {this.renderAudioControls()}
          </div>

          <h1
            style={{
              textAlign: "center",
              color: isMobile ? "#fff" : `rgb(${this.getColor(0).r}, ${this.getColor(0).g}, ${this.getColor(0).b})`,
              fontSize: isMobile ? 28 : 50,
              padding: isMobile ? "0 20px" : "0",
              textShadow: isMobile ? "2px 2px 4px rgba(0,0,0,0.5)" : "none",
            }}
          >
            ♥️នេះគឺជាសម្លេងរបស់ខ្ញុំក្នុងសាលារៀន KSHRD♥️
          </h1>

          {loading ? this.renderSpinner() : this.renderVoiceTimeline()}
        </div>
      </>
    );
  }
}

export default HomePage;
// Enhanced styles with mobile optimizations
const styles = {
  audioControlContainer: {
    position: "fixed",
    top: 60,
    right: 20,
    zIndex: 1000,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 8,
    padding: 12,
  },
  mobileAudioContainer: {
    position: "fixed",
    top: 10,
    right: 10,
    zIndex: 1000,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    borderRadius: 6,
    padding: 8,
  },
  audioButton: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: 6,
    padding: "12px 16px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
    transition: "background-color 0.3s",
  },
  audioControl: {
    display: "flex",
    alignItems: "center",
    color: "white",
    fontSize: "14px",
  },
  smallButton: {
    backgroundColor: "transparent",
    color: "white",
    border: "1px solid white",
    borderRadius: 4,
    padding: 6,
    marginLeft: 8,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
  },
  loadMoreContainer: {
    display: "flex",
    justifyContent: "center",
    padding: "40px 20px",
  },
  loadMoreButton: {
    backgroundColor: "#2196F3",
    color: "white",
    border: "none",
    borderRadius: 8,
    padding: "15px 30px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "background-color 0.3s",
    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
  },
};