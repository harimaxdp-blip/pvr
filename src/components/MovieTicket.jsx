import React, { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useParams } from "react-router-dom";
import "./MovieTicket.css";
import accessibilityBanner from "../assets/accessibility-banner.jpeg";
import pvrLogo from "../assets/pvr-inox-logo.svg";

import posterDC from "../assets/poster-dc.jpg";
import posterVishwanath from "../assets/poster-vishwanath.jpg";
import posterGDN from "../assets/1.avif";
import posterMakutam from "../assets/2.webp";
import posterSpiderman from "../assets/poster-spiderman.jpg";


/* =========================================================
   TICKET ID
========================================================= */

function generateTicketId() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const digits = "0123456789";

  const pick = (str) =>
    str[Math.floor(Math.random() * str.length)];

  let id = "TD";

  for (let i = 0; i < 3; i++) {
    id += pick(letters);
  }

  id += pick(digits);
  id += pick(letters);

  return id;
}


/* =========================================================
   QR VALUE
========================================================= */
function generateQrValue(ticketId) {
  const random = Math.random()
    .toString(36)
    .slice(2, 8)
    .toUpperCase();

  return `PVRINOX-MOVIE-TICKET-${ticketId}-${random}-M13-M14-M15-SCREEN2-31JUL-1PM`;
}
/* =========================================================
   RECOMMENDED MOVIES
========================================================= */

const recommendedMovies = [
  {
    title: "DC",
    image: posterSpiderman,
  },
  {
    title: "Vishwanath & Sons",
    image: posterVishwanath,
  },
  {
    title: "G.D.N",
    image: posterGDN,
  },
  {
    title: "Makutam",
    image: posterMakutam,
  },
];


/* =========================================================
   SOCIAL ICON
========================================================= */

const SocialIcon = ({ path }) => (
  <svg
    viewBox="0 0 24 24"
    width="22"
    height="22"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d={path} />
  </svg>
);


/* =========================================================
   ICONS
========================================================= */

const ICONS = {
  facebook:
    "M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.5 1.49-3.89 3.78-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.9h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94z",

  instagram:
    "M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.64.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92-.06-1.27-.07-1.65-.07-4.85s.02-3.58.07-4.85C2.38 3.9 3.9 2.38 7.15 2.23 8.42 2.17 8.8 2.16 12 2.16zM12 0C8.74 0 8.33.01 7.05.07 2.7.27.27 2.7.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.35 2.62 6.78 6.98 6.98 1.28.06 1.69.07 4.95.07s3.67-.01 4.95-.07c4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95C23.73 2.7 21.3.27 16.95.07 15.67.01 15.26 0 12 0zm0 5.84A6.16 6.16 0 1 0 12 18.16 6.16 6.16 0 0 0 12 5.84zm0 10.16A4 4 0 1 1 12 8a4 4 0 0 1 0 8zm6.4-10.4a1.44 1.44 0 1 1 0-2.88 1.44 1.44 0 0 1 0 2.88z",

  youtube:
    "M23.5 6.2a3.02 3.02 0 0 0-2.12-2.14C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.38.56A3.02 3.02 0 0 0 .5 6.2 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.8 3.02 3.02 0 0 0 2.12 2.14C4.5 20.5 12 20.5 12 20.5s7.5 0 9.38-.56a3.02 3.02 0 0 0 2.12-2.14A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.8zM9.6 15.6V8.4l6.4 3.6-6.4 3.6z",

  x:
    "M18.9 2H22l-7.4 8.5L23.3 22H16.7l-5.2-6.8L5.5 22H2.3l7.9-9.1L1 2h6.8l4.7 6.2L18.9 2zm-1.2 18h1.7L7.4 3.9H5.6L17.7 20z",

  linkedin:
    "M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.83v1.64h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.77 2.65 4.77 6.1V21h-4v-5.4c0-1.29-.02-2.95-1.8-2.95-1.8 0-2.08 1.4-2.08 2.86V21H9z",
};


/* =========================================================
   COMPONENT
========================================================= */

export default function MovieTicket() {
  const { ticketId: urlTicketId } = useParams();

  const [ticketId, setTicketId] = useState("");
  const [qrValue, setQrValue] = useState("");

  useEffect(() => {
    const id = generateTicketId();

    setTicketId(id);
    setQrValue(generateQrValue(id));
  }, []);

  return (
    <main className="ticket-page">

      {/* =================================================
          TICKET CONTAINER (NEW)
          Wraps card + promo + footer so all three scale off
          the SAME width reference via CSS container queries.
      ================================================= */}

      <div className="ticket-container">

        {/* =================================================
            MAIN OUTER CARD
        ================================================= */}

        <div className="ticket-card">

          {/* HEADER */}

          <header className="ticket-header">
            <img
              src={pvrLogo}
              alt="PVR INOX"
              className="ticket-logo"
            />
          </header>


          {/* =================================================
              TICKET CONTENT
          ================================================= */}

          <div className="ticket-body">

            <div className="ticket-inner">

              {/* THEATRE */}

              <h1 className="theatre-name">
                PVR Providence Mall Pondicherry
              </h1>

              <p className="theatre-address">
                PVR INOX Limited., Providence Mall,4th and 5th Floor,
                Venkatasubba Reddiyar Salai,Via Cuddalore Road, Near Malai
                Malar,Pondicherry,Tamil Nadu 605001,Ind
              </p>


              {/* MOVIE */}

              <h2 className="movie-title">
                DC (Tamil with English Subtitle) (T.B.A)
              </h2>
{/* MOVIE 
              <p className="movie-rating">
                Tamil UA 13+
              </p>

*/}
              {/* DATE / TIME */}

              <div className="info-row">

                <div className="info-block">
                  <span className="info-label">
                    Date
                  </span>

                  <span className="info-value">
                    Thu, 20 Aug
                  </span>
                </div>


                <div className="info-block align-right">
                  <span className="info-label">
                    Time
                  </span>

                  <span className="info-value">
                    10:20 PM - 1:24 AM
                  </span>
                </div>

              </div>


              {/* SCREEN / SEATS */}

              <div className="info-row screen-row">

                <div className="info-block">
                  <span className="info-label">
                    Screen
                  </span>

                  <span className="info-value">
                    SCREEN-5
                  </span>
                </div>


                <div className="info-block align-right">

                  <span className="info-label">
                    Seats
                  </span>

                  <div className="seat-badges">

                    <span className="seat-badge">
                      K22
                    </span>

                    <span className="seat-badge">
                    K23
                    </span>

                  </div>

                </div>

              </div>


              {/* =================================================
                  QR + TICKET ID
              ================================================= */}

              <div className="qr-row">

                <div className="qr-box">
  {qrValue && (
    <QRCodeSVG
      value={qrValue}
      size={230}
      level="M"
      includeMargin={false}
    />
  )}
</div>


                <div className="ticket-id-block">

                  <span className="info-label">
                    Ticket ID
                  </span>

                  <span className="ticket-id-value">
                    {ticketId}
                  </span>

                </div>

              </div>


              {/* NOTE */}

              <p className="ticket-note">
                <span>
                  The movie ticket invoice will be shared shortly after booking.
                </span>
              </p>

            </div>

          </div>


          {/* =================================================
              RECOMMENDED MOVIES
              INSIDE OUTER CARD
          ================================================= */}
{/* =================================================
    ACCESSIBILITY BANNER
================================================= */}

<div className="accessibility-banner">
  <img
    src={accessibilityBanner}
    alt="Cinema accessibility features"
  />
</div>

          <section className="recommended-section">

            <h3 className="recommended-title">
              Recommended Movies
            </h3>


            <div className="recommended-grid">

              {recommendedMovies.map((movie) => (

                <div
                  className="recommended-card"
                  key={movie.title}
                >

                  <img
                    src={movie.image}
                    alt={movie.title}
                  />

                </div>

              ))}

            </div>

          </section>

        </div>


        {/* =================================================
            PROMO
        ================================================= */}

        <div className="promo-banner">

          <img
            src={posterDC}
            alt="Spiderman Brand New Day"
          />

        </div>


        {/* =================================================
            FOOTER
        ================================================= */}

        <footer className="ticket-footer">

          <div className="footer-icons">

            <a href="#" aria-label="Facebook">
              <SocialIcon path={ICONS.facebook} />
            </a>

            <a href="#" aria-label="Instagram">
              <SocialIcon path={ICONS.instagram} />
            </a>

            <a href="#" aria-label="YouTube">
              <SocialIcon path={ICONS.youtube} />
            </a>

            <a href="#" aria-label="X">
              <SocialIcon path={ICONS.x} />
            </a>

            <a href="#" aria-label="LinkedIn">
              <SocialIcon path={ICONS.linkedin} />
            </a>

          </div>


          <div className="footer-links">

            <a href="#">
              Terms &amp; Conditions
            </a>

            <a href="#">
              FAQs
            </a>

            <a href="#">
              Feedback/Help
            </a>

          </div>

        </footer>

      </div>

    </main>
  );
}