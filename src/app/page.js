"use client";
import React, { Component } from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import SchoolIcon from "@material-ui/icons/School";
import StarIcon from "@material-ui/icons/Star";
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";
import moment from "moment";
import quote from "./quote";
import Loader from "react-loader-spinner";
import LazyEmbed from "./LazyEmbed";

// Dynamically import ParticlesBg with reduced rendering
const ParticlesBg = dynamic(() => import("particles-bg"), {
  ssr: false,
  loading: () => null, // Prevent loading flash
});

// SEO Keywords and metadata
const SEO_CONFIG = {
  title:
    "KSHRD Student Voice | Korean Software HRD Center | Raden HRD Learning Journey",
  description:
    "Discover the learning journey at KSHRD (Korean Software HRD Center). Listen to student voices, experiences, and testimonials from HRD Center programs. Raden's educational portfolio showcasing software development skills learned at Korean Software HRD Center.",
  keywords:
    "raden, HRD Center, HRD, hrd, kshrd, KSHRD, Korean Software HRD Center, software development, programming education, student voice, learning journey, Cambodia tech education, coding bootcamp, software engineering training",
  author: "Raden - KSHRD Student",
  url: typeof window !== "undefined" ? window.location.href : "",
  siteName: "KSHRD Student Portfolio - Raden",
};

// Memoized TimelineItem component
class TimelineItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isVisible: false,
      hasIntersected: false,
    };
    this.itemRef = React.createRef();
  }

  componentDidMount() {
    // Intersection Observer for lazy loading
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !this.state.hasIntersected) {
            this.setState({
              isVisible: true,
              hasIntersected: true,
            });
            // Disconnect observer after first intersection
            this.observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: "100px 0px", // Load 100px before coming into view
        threshold: 0.1,
      }
    );

    if (this.itemRef.current) {
      this.observer.observe(this.itemRef.current);
    }
  }

  componentWillUnmount() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    // Only update if visibility changes or props change
    return (
      this.state.isVisible !== nextState.isVisible ||
      this.state.hasIntersected !== nextState.hasIntersected ||
      this.props.data !== nextProps.data
    );
  }

  render() {
    const { data, index, fileDate, backgroundColor, textColor } = this.props;
    const { isVisible, hasIntersected } = this.state;

    // Determine position based on index (left for even, right for odd)
    const position = index % 2 === 0 ? "left" : "right";

    // Adjust arrow direction based on position
    const contentArrowStyle =
      position === "left"
        ? { borderRight: "7px solid rgb(33, 150, 243)" }
        : { borderLeft: "7px solid rgb(33, 150, 243)" };

    return (
      <div ref={this.itemRef} style={{ marginBottom: "40px" }}>
        <VerticalTimelineElement
          className="vertical-timeline-element--work"
          position={position}
          contentStyle={{
            background: backgroundColor,
            color: textColor,
          }}
          contentArrowStyle={contentArrowStyle}
          date={
            moment(fileDate).format("ddd MMMM Do YYYY, h:mm:ss a") +
            " -- " +
            moment(fileDate).startOf("day").fromNow()
          }
          iconStyle={{ background: "rgb(33, 150, 243)", color: "#fff" }}
          icon={<SchoolIcon />}
        >
          {hasIntersected && isVisible ? (
            <>
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
              <p>{this.props.quote}</p>
            </>
          ) : (
            <div
              style={{
                height: "200px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div>Loading...</div>
            </div>
          )}
        </VerticalTimelineElement>
      </div>
    );
  }
}

class HomePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      isPlaying: false,
      showPlayButton: true,
      loading: true,
    };

    // Pre-generate colors and quotes to avoid re-computation
    this.colorsAndQuotes = [];
  }

  componentDidMount() {
    // Fetch data
    this.fetchData();

    // Add structured data
    this.addStructuredData();
  }

  // Pre-generate colors and quotes to avoid re-computation
  preGenerateColorsAndQuotes = (count) => {
    this.colorsAndQuotes = Array.from({ length: count }, (_, index) => ({
      backgroundColor: `rgb(${this.randomColor()}, ${this.randomColor()}, ${this.randomColor()})`,
      textColor: index % 2 === 0 ? "#000" : "#FFF",
      quote: this.getQuote(),
    }));
  };

  // Add structured data for better SEO
  addStructuredData = () => {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "EducationalOrganization",
      name: "Korean Software HRD Center (KSHRD)",
      alternateName: ["KSHRD", "HRD Center", "Korean Software HRD Center"],
      description:
        "Leading software development training center in Cambodia, providing comprehensive programming education and HRD services.",
      url: SEO_CONFIG.url,
      sameAs: ["https://www.radenhor.com"],
      location: {
        "@type": "Place",
        name: "Phnom Penh, Cambodia",
        address: {
          "@type": "PostalAddress",
          addressCountry: "KH",
          addressLocality: "Phnom Penh",
        },
      },
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Software Development Programs",
        itemListElement: [
          {
            "@type": "Course",
            name: "Software Development Training",
            description:
              "Comprehensive software development and programming training at KSHRD",
            provider: {
              "@type": "Organization",
              name: "Korean Software HRD Center",
            },
          },
        ],
      },
    };

    const personData = {
      "@context": "https://schema.org",
      "@type": "Person",
      name: "Raden",
      description:
        "Software development student at Korean Software HRD Center (KSHRD)",
      alumniOf: {
        "@type": "EducationalOrganization",
        name: "Korean Software HRD Center (KSHRD)",
      },
      url: SEO_CONFIG.url,
    };

    // Add to head
    const script1 = document.createElement("script");
    script1.type = "application/ld+json";
    script1.text = JSON.stringify(structuredData);
    document.head.appendChild(script1);

    const script2 = document.createElement("script");
    script2.type = "application/ld+json";
    script2.text = JSON.stringify(personData);
    document.head.appendChild(script2);
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

        // Pre-generate colors and quotes
        this.preGenerateColorsAndQuotes(sortedData.length);

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

  renderVoiceTimeline() {
    return (
      <VerticalTimeline>
        {this.state.data.map((data, index) => {
          const fileDate =
            this.extractDateFromFilename(data.name) ||
            new Date(data.lastModified);

          const colorAndQuote = this.colorsAndQuotes[index] || {
            backgroundColor: "rgb(33, 150, 243)",
            textColor: "#FFF",
            quote: "Loading...",
          };

          return (
            <TimelineItem
              key={`${data.name}-${index}`} // More stable key
              data={data}
              index={index}
              fileDate={fileDate}
              backgroundColor={colorAndQuote.backgroundColor}
              textColor={colorAndQuote.textColor}
              quote={colorAndQuote.quote}
            />
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
    const titleColor = `rgb(${this.randomColor()}, ${this.randomColor()}, ${this.randomColor()})`;

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
          {/* Background particles - only render if enabled */}
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
            <ParticlesBg type="random" num={30} bg={true} />
          </div>

          <h1
            style={{
              textAlign: "center",
              color: titleColor,
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

export default HomePage;
