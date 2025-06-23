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
import ResponsiveEmbed from "react-responsive-embed";
import moment from "moment";
import quote from "./quote";
import Loader from "react-loader-spinner";
import LazyEmbed from './LazyEmbed'

// Dynamically import ParticlesBg to avoid SSR issues
const ParticlesBg = dynamic(() => import("particles-bg"), { ssr: false });

class HomePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      audioLoaded: false,
      audioReady: false,
      isPlaying: false,
      showPlayButton: true,
      loading: true,
    };
    this.audioRef = null;
  }

  componentDidMount() {
    // Load audio
    this.loadAudio();

    // Fetch data
    this.fetchData();
  }

  componentWillUnmount() {
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
    // Loop the audio
    if (this.audioRef) {
      this.audioRef.currentTime = 0;
      this.audioRef.play().catch(console.error);
    }
  };

  // Handle user click to start audio
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
      // Call API route instead of using Minio client directly
      const response = await fetch("/api/minio/list");
      const data = await response.json();
      if (data.success) {
        // Sort files by date extracted from filename (newest first)
        const sortedData = data.objects.sort((a, b) => {
          const dateA =
            this.extractDateFromFilename(a.name) || new Date(a.lastModified);
          const dateB =
            this.extractDateFromFilename(b.name) || new Date(b.lastModified);
          return dateB - dateA; // Newest first
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

  randomColor() {
    return Math.floor(Math.random() * Math.floor(250));
  }

  getQuote() {
    let randomIndex = Math.floor(
      Math.random() * Math.floor(quote.quotes.length - 1)
    );
    return quote.quotes[randomIndex].quote;
  }

  extractDateFromFilename(filename) {
    // Extract date from filename prefix (format: YYYYMMDD)
    const dateMatch = filename.match(/^(\d{8})/);
    if (dateMatch) {
      const dateStr = dateMatch[1];
      const year = dateStr.substring(0, 4);
      const month = dateStr.substring(4, 6);
      const day = dateStr.substring(6, 8);

      // Create date object (month is 0-indexed in JavaScript)
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }

    // Fallback to lastModified if no date prefix found
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
    return (
      <VerticalTimeline>
        {this.state.data.map((data, index) => {
          const fileDate =
            this.extractDateFromFilename(data.name) ||
            new Date(data.lastModified);
          return (
            <VerticalTimelineElement
              key={index}
              className="vertical-timeline-element--work"
              contentStyle={{
                background: `rgb(${this.randomColor()}, ${this.randomColor()}, ${this.randomColor()})`,
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
                src={
                  data.url || data.publicUrl || `/api/minio/file/${data.name}`
                }
                contentType={data.contentType}
                ratio="4:3"
              />
              <h3 className="vertical-timeline-element-title">
                Title: {data.name.split(".")[0]}
              </h3>
              <h4 className="vertical-timeline-element-subtitle">
                Size: {(data.size / 1024 / 1024).toFixed(2)} MB
              </h4>
              <p>{this.getQuote()}</p>
            </VerticalTimelineElement>
          );
        })}
        <VerticalTimelineElement
          iconStyle={{ background: "rgb(16, 204, 82)", color: "#fff" }}
          icon={<StarIcon />}
        />
      </VerticalTimeline>
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
            height: this.state.loading ? "100vh" : "auto",
            justifyContent: "center",
          }}
        >
          {/* Background particles */}
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

          {/* Audio controls - positioned at top right */}
          <div style={styles.audioControlContainer}>
            {this.renderAudioControls()}
          </div>

          <h1
            style={{
              textAlign: "center",
              color: `rgb(${this.randomColor()}, ${this.randomColor()}, ${this.randomColor()})`,
              fontSize: 50,
            }}
          >
            ♥️នេះគឺជាសម្លេងរបស់ខ្ញុំក្នុងសាលារៀន KSHRD♥️
          </h1>

          {this.state.loading
            ? this.renderSpinner()
            : this.renderVoiceTimeline()}
        </div>
      </>
    );
  }
}

// Styles for audio controls
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
};

export default HomePage;
