import React, { useEffect, useRef, useState } from "react";
import {
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";

import { db } from "../firebase";
import "./UpdateTicket.css";

// =====================================================
// ONE FIXED FIRESTORE DOCUMENT
// =====================================================

const TICKET_COLLECTION = "tickets";
const TICKET_DOCUMENT = "current";

// =====================================================
// CURRENT DATE
// =====================================================

function getToday() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// =====================================================
// EMPTY MOVIE
// =====================================================

const emptyMovie = {
  image: "",
  url: "",
};

// =====================================================
// EMPTY FORM
// =====================================================

function createEmptyForm() {
  return {
    theatreName: "",
    theatreAddress: "",

    movieTitle: "",

    date: getToday(),

    startTime: "21:45",
    endTime: "00:10",

    screen: "",

    seats: [],

    promoImage: "",

    recommendedMovies: [
      { ...emptyMovie },
      { ...emptyMovie },
      { ...emptyMovie },
      { ...emptyMovie },
    ],
  };
}

// =====================================================
// SEAT MAP CONFIGURATION
//
// Flat A → P grid. Every row has 32 seats, numbered 1
// to 32 (rendered as text, split into two 16-seat blocks
// with a single aisle gap in the middle for readability).
//
// To mark a seat as already booked, add its number
// (as a string) to that row's "occupied" array, e.g.
//   occupied: ["5", "6", "7"]
// It will render grayed-out and disabled.
//
// To change the layout (add/remove rows or seats per
// row), just edit ROW_LETTERS / SEATS_PER_ROW below.
// =====================================================

const ROW_LETTERS = [
  "A", "B", "C", "D", "E", "F", "G", "H",
  "I", "J", "K", "L", "M", "N", "O", "P",
];

const SEATS_PER_ROW = 32;

function buildSeatRows() {
  const seatNumbers = Array.from(
    { length: SEATS_PER_ROW },
    (_, i) => String(i + 1)
  );

  return ROW_LETTERS.map((letter) => ({
    row: letter,
    seats: seatNumbers,
    occupied: [], // e.g. ["12", "13"] to block seats out
  }));
}

const SEAT_ROWS = buildSeatRows();

// =====================================================
// FLATTEN ALL SEAT IDS (row + number, e.g. "A1", "P32")
// =====================================================

function generateAllSeatIds() {
  const seats = [];

  SEAT_ROWS.forEach((r) => {
    r.seats.forEach((n) => {
      seats.push(`${r.row}${n}`);
    });
  });

  return seats;
}

const allSeats = generateAllSeatIds();

// =====================================================
// TICKET ID GENERATION
//
// 7-character random mix of uppercase letters and
// digits (e.g. "TDAAA9R") — same shape as a real
// alphanumeric booking / ticket code, different every
// time it's generated.
// =====================================================

const TICKET_ID_LENGTH = 7;
const TICKET_ID_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function generateRandomTicketId() {
  let id = "";

  for (let i = 0; i < TICKET_ID_LENGTH; i++) {
    id += TICKET_ID_CHARS.charAt(
      Math.floor(Math.random() * TICKET_ID_CHARS.length)
    );
  }

  return id;
}

// =====================================================
// COMPONENT
// =====================================================

function UpdateTicket() {
  // ===================================================
  // TICKET ID
  // ===================================================

  const [ticketId, setTicketId] = useState("");

  // ===================================================
  // NUMBER OF SEATS
  // ===================================================

  const [numberOfSeats, setNumberOfSeats] = useState(2);

  // ===================================================
  // FORM
  // ===================================================

  const [form, setForm] = useState(createEmptyForm());

  // ===================================================
  // STATUS (inline text under the form)
  // ===================================================

  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);

  // ===================================================
  // TOAST (prominent floating indicator)
  // ===================================================

  const [toast, setToast] = useState(null); // { type: "success" | "error" | "info", text }
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimerRef = useRef(null);
  const toastHideTimerRef = useRef(null);

  const showToast = (type, text) => {
    setMessage(text);

    setToast({ type, text });

    // allow the DOM to paint the toast before animating in
    requestAnimationFrame(() => setToastVisible(true));

    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    if (toastHideTimerRef.current) clearTimeout(toastHideTimerRef.current);

    toastTimerRef.current = setTimeout(() => {
      setToastVisible(false);

      toastHideTimerRef.current = setTimeout(() => {
        setToast(null);
      }, 300);
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      if (toastHideTimerRef.current) clearTimeout(toastHideTimerRef.current);
    };
  }, []);

  // ===================================================
  // FIRESTORE REFERENCE
  //
  // IMPORTANT:
  // This is ALWAYS the same document.
  // ===================================================

  const ticketRef = doc(
    db,
    TICKET_COLLECTION,
    TICKET_DOCUMENT
  );

  // ===================================================
  // GENERATE TICKET ID
  // ===================================================

  const generateTicketId = () => {
    const newId = generateRandomTicketId();

    setTicketId(newId);

    showToast("info", `New Ticket ID generated: ${newId}`);
  };

  // ===================================================
  // LOAD EXISTING DATA
  // ===================================================

  const loadTicket = async () => {
    setLoading(true);

    try {
      const snapshot = await getDoc(ticketRef);

      // -----------------------------------------------
      // NO DATA YET
      // -----------------------------------------------

      if (!snapshot.exists()) {
        showToast("info", "No ticket found. Create a new ticket.");

        setLoading(false);
        return;
      }

      const data = snapshot.data();

      // -----------------------------------------------
      // LOAD SEATS
      // -----------------------------------------------

      let loadedSeats = [];

      if (Array.isArray(data.seats)) {
        loadedSeats = data.seats;
      } else if (data.seats) {
        loadedSeats = Object.values(data.seats);
      }

      // -----------------------------------------------
      // LOAD RECOMMENDED MOVIES
      // -----------------------------------------------

      let loadedMovies = [];

      if (
        Array.isArray(
          data.recommendedMovies
        )
      ) {
        loadedMovies = data.recommendedMovies;
      } else if (
        data.recommendedMovies
      ) {
        loadedMovies = Object.values(
          data.recommendedMovies
        );
      }

      // Always keep 4 movie slots
      while (loadedMovies.length < 4) {
        loadedMovies.push({
          ...emptyMovie,
        });
      }

      // -----------------------------------------------
      // LOAD EVERYTHING
      // -----------------------------------------------

      setTicketId(
        data.ticketId || ""
      );

      setForm({
        theatreName:
          data.theatreName || "",

        theatreAddress:
          data.theatreAddress || "",

        movieTitle:
          data.movieTitle || "",

        date:
          data.date || getToday(),

        startTime:
          data.startTime || "21:45",

        endTime:
          data.endTime || "00:10",

        screen:
          data.screen || "",

        seats:
          loadedSeats,

        promoImage:
          data.promoImage || "",

        recommendedMovies:
          loadedMovies,
      });

      setNumberOfSeats(
        loadedSeats.length || 1
      );

      showToast("success", "Existing ticket loaded.");
    } catch (error) {
      console.error(
        "LOAD ERROR:",
        error
      );

      showToast("error", "Failed to load ticket.");
    }

    setLoading(false);
  };

  // ===================================================
  // AUTOMATICALLY LOAD OLD DATA
  // ===================================================

  useEffect(() => {
    loadTicket();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===================================================
  // NORMAL INPUT CHANGE
  // ===================================================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ===================================================
  // NUMBER OF SEATS
  // ===================================================

  const handleNumberOfSeats = (e) => {
    const count = Number(
      e.target.value
    );

    setNumberOfSeats(count);

    setForm((previous) => {
      let selected = [
        ...previous.seats,
      ];

      // Reduce seats
      if (selected.length > count) {
        selected =
          selected.slice(0, count);
      }

      return {
        ...previous,
        seats: selected,
      };
    });
  };

  // ===================================================
  // SELECT / UNSELECT SEAT
  // ===================================================

  const toggleSeat = (seat) => {
    setForm((previous) => {
      const alreadySelected =
        previous.seats.includes(
          seat
        );

      // ---------------------------------------------
      // REMOVE
      // ---------------------------------------------

      if (alreadySelected) {
        return {
          ...previous,

          seats:
            previous.seats.filter(
              (item) =>
                item !== seat
            ),
        };
      }

      // ---------------------------------------------
      // MAXIMUM
      // ---------------------------------------------

      if (
        previous.seats.length >=
        numberOfSeats
      ) {
        showToast(
          "info",
          `You can select only ${numberOfSeats} seats.`
        );

        return previous;
      }

      // ---------------------------------------------
      // ADD
      // ---------------------------------------------

      return {
        ...previous,

        seats: [
          ...previous.seats,
          seat,
        ],
      };
    });
  };

  // ===================================================
  // RECOMMENDED MOVIE CHANGE
  // ===================================================

  const handleRecommendedChange = (
    index,
    field,
    value
  ) => {
    setForm((previous) => {
      const movies = [
        ...previous.recommendedMovies,
      ];

      movies[index] = {
        ...movies[index],
        [field]: value,
      };

      return {
        ...previous,
        recommendedMovies:
          movies,
      };
    });
  };

  // ===================================================
  // RENDER A SINGLE SEAT BUTTON
  // (number is shown as plain text on the button)
  // ===================================================

  const renderSeatButton = (number, rowLabel, occupiedList) => {
    const seat = `${rowLabel}${number}`;
    const selected = form.seats.includes(seat);
    const occupied = Boolean(
      occupiedList && occupiedList.includes(number)
    );

    let className = "seat";
    if (occupied) className = "seat occupied";
    else if (selected) className = "seat selected";

    return (
      <button
        type="button"
        key={seat}
        className={className}
        title={occupied ? `${seat} (occupied)` : seat}
        disabled={occupied}
        onClick={() => toggleSeat(seat)}
      >
        {number}
      </button>
    );
  };

  // ===================================================
  // SAVE / REPLACE FIRESTORE DATA
  // ===================================================

  const saveTicket = async (e) => {
    e.preventDefault();

    if (!ticketId.trim()) {
      showToast("error", "Generate a Ticket ID first.");
      return;
    }

    if (
      form.seats.length !==
      numberOfSeats
    ) {
      showToast(
        "error",
        `Please select ${numberOfSeats} seats.`
      );

      return;
    }

    setLoading(true);

    try {
      // =================================================
      // IMPORTANT
      //
      // We DO NOT use ticketId as Firestore document ID.
      //
      // Everything is saved to:
      //
      // tickets/current
      //
      // setDoc(..., { merge: false })
      // completely replaces the old document.
      // =================================================

      const ticketData = {
        ticketId:
          ticketId.trim(),

        theatreName:
          form.theatreName,

        theatreAddress:
          form.theatreAddress,

        movieTitle:
          form.movieTitle,

        date:
          form.date || getToday(),

        startTime:
          form.startTime,

        endTime:
          form.endTime,

        screen:
          form.screen,

        seats:
          form.seats,

        promoImage:
          form.promoImage,

        recommendedMovies:
          form.recommendedMovies,

        updatedAt:
          new Date().toISOString(),
      };

      // =================================================
      // REPLACE OLD DOCUMENT
      // =================================================

      await setDoc(
        ticketRef,
        ticketData,
        {
          merge: false,
        }
      );

      showToast(
        "success",
        "Ticket updated successfully — old data replaced."
      );

      console.log(
        "Firebase document replaced:",
        ticketData
      );
    } catch (error) {
      console.error(
        "SAVE ERROR:",
        error
      );

      showToast("error", "Failed to save ticket.");
    }

    setLoading(false);
  };

  // ===================================================
  // UI
  // ===================================================

  return (
    <div className="update-page">

      {/* =============================================
          TOAST — floating indicator for load / save /
          update actions
      ============================================= */}

      {toast && (
        <div className="toast-wrap" aria-live="polite">
          <div
            className={`toast toast-${toast.type} ${
              toastVisible ? "toast-show" : ""
            }`}
          >
            <span className="toast-icon">
              {toast.type === "success" && "✓"}
              {toast.type === "error" && "!"}
              {toast.type === "info" && "i"}
            </span>
            <span>{toast.text}</span>
          </div>
        </div>
      )}

      <div className="update-container">

        <h1>
          PVR Ticket Update
        </h1>

        <p className="update-subtitle">
          Create or update your movie ticket
        </p>

        {/* =============================================
            TICKET ID
        ============================================= */}

        <div className="ticket-id-section">

          <label>
            Ticket ID
          </label>

          <div className="ticket-id-row">

            <input
              type="text"
              value={ticketId}
              onChange={(e) =>
                setTicketId(
                  e.target.value.toUpperCase()
                )
              }
              placeholder="Enter Ticket ID"
              maxLength={TICKET_ID_LENGTH}
            />

            <button
              type="button"
              className="generate-button"
              onClick={
                generateTicketId
              }
              disabled={loading}
            >
              GENERATE
            </button>

            <button
              type="button"
              className="load-button"
              onClick={
                loadTicket
              }
              disabled={loading}
            >
              {loading
                ? "LOADING..."
                : "LOAD"}
            </button>

          </div>

        </div>

        {/* =============================================
            FORM
        ============================================= */}

        <form
          id="ticket-form"
          onSubmit={
            saveTicket
          }
        >

          {/* ===========================================
              THEATRE
          =========================================== */}

          <section className="update-section">

            <h2>
              Theatre
            </h2>

            <label>
              Theatre Name
            </label>

            <input
              name="theatreName"
              value={
                form.theatreName
              }
              onChange={
                handleChange
              }
              placeholder="PVR Providence Mall Pondicherry"
            />

            <label>
              Theatre Address
            </label>

            <textarea
              name="theatreAddress"
              value={
                form.theatreAddress
              }
              onChange={
                handleChange
              }
              placeholder="Enter theatre address"
            />

          </section>

          {/* ===========================================
              MOVIE
          =========================================== */}

          <section className="update-section">

            <h2>
              Movie
            </h2>

            <label>
              Movie Name
            </label>

            <input
              name="movieTitle"
              value={
                form.movieTitle
              }
              onChange={
                handleChange
              }
              placeholder="Movie title"
            />

          </section>

          {/* ===========================================
              SHOW DETAILS
          =========================================== */}

          <section className="update-section">

            <h2>
              Show Details
            </h2>

            {/* DATE */}

            <label>
              Date
            </label>

            <input
              type="date"
              name="date"
              value={
                form.date
              }
              onChange={
                handleChange
              }
            />

            {/* TIME */}

            <div className="time-grid">

              <div>

                <label>
                  Start Time
                </label>

                <input
                  type="time"
                  name="startTime"
                  value={
                    form.startTime
                  }
                  onChange={
                    handleChange
                  }
                />

              </div>

              <div>

                <label>
                  End Time
                </label>

                <input
                  type="time"
                  name="endTime"
                  value={
                    form.endTime
                  }
                  onChange={
                    handleChange
                  }
                />

              </div>

            </div>

            {/* SCREEN */}

            <label>
              Screen Number
            </label>

            <input
              name="screen"
              value={
                form.screen
              }
              onChange={
                handleChange
              }
              placeholder="SCREEN-5"
            />

            {/* NUMBER OF SEATS */}

            <label>
              Number of Seats
            </label>

            <select
              value={
                numberOfSeats
              }
              onChange={
                handleNumberOfSeats
              }
            >

              {Array.from(
                {
                  length: 10,
                },
                (_, index) =>
                  index + 1
              ).map(
                (number) => (
                  <option
                    key={number}
                    value={number}
                  >
                    {number}{" "}
                    {number === 1
                      ? "Seat"
                      : "Seats"}
                  </option>
                )
              )}

            </select>

            {/* SELECTED SEATS */}

            <div className="selected-seat-display">

              <strong>
                Selected Seats
              </strong>

              <div className="selected-seat-list">

                {form.seats.length >
                0 ? (
                  form.seats.map(
                    (seat) => (
                      <span
                        key={seat}
                        className="selected-seat"
                      >
                        {seat}
                      </span>
                    )
                  )
                ) : (
                  <span className="no-seat">
                    No seats selected
                  </span>
                )}

              </div>

            </div>

            {/* =========================================
                SEAT MAP (flat A–P grid, seats 1–32)
            ========================================= */}

            <div className="seat-map">

              <div className="screen-wrap">
                <span className="screen-text">SCREEN</span>

                <svg
                  className="screen-arc"
                  viewBox="0 0 800 90"
                  preserveAspectRatio="xMidYMid meet"
                >
                  <path
                    d="M 20 80 Q 400 -10 780 80"
                    fill="none"
                    stroke="#222"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <div className="seat-legend">
                <span className="legend-item">
                  <span className="legend-box legend-available" />
                  Available
                </span>
                <span className="legend-item">
                  <span className="legend-box legend-selected" />
                  Selected
                </span>
                <span className="legend-item">
                  <span className="legend-box legend-occupied" />
                  Occupied
                </span>
              </div>

              <p className="seat-map-hint">
                Swipe sideways to see all seats →
              </p>

              <div className="seat-section">

                {SEAT_ROWS.map((r) => (
                  <div
                    className="seat-row"
                    key={r.row}
                  >

                    <span className="row-label">
                      {r.row}
                    </span>

                    <div className="seat-row-buttons">

                      {r.seats
                        .slice(0, 16)
                        .map((n) =>
                          renderSeatButton(n, r.row, r.occupied)
                        )}

                      <span className="seat-gap" />

                      {r.seats
                        .slice(16)
                        .map((n) =>
                          renderSeatButton(n, r.row, r.occupied)
                        )}

                    </div>

                    <span className="row-label">
                      {r.row}
                    </span>

                  </div>
                ))}

              </div>

            </div>

          </section>

          {/* ===========================================
              PROMO
          =========================================== */}

          <section className="update-section">

            <h2>
              Promo Banner
            </h2>

            <label>
              Image URL
            </label>

            <input
              type="url"
              name="promoImage"
              value={
                form.promoImage
              }
              onChange={
                handleChange
              }
              placeholder="https://example.com/banner.jpg"
            />

            {form.promoImage && (
              <img
                className="promo-preview"
                src={
                  form.promoImage
                }
                alt="Promo preview"
              />
            )}

          </section>

          {/* ===========================================
              RECOMMENDED MOVIES
          =========================================== */}

          <section className="update-section">

            <h2>
              Recommended Movies
            </h2>

            <p className="section-help">
              Add the poster image URL and the
              page URL that should open when clicked.
            </p>

            {form.recommendedMovies.map(
              (movie, index) => (

                <div
                  className="recommended-editor"
                  key={index}
                >

                  <h3>
                    Movie {index + 1}
                  </h3>

                  <label>
                    Image URL
                  </label>

                  <input
                    type="url"
                    value={
                      movie.image
                    }
                    onChange={(e) =>
                      handleRecommendedChange(
                        index,
                        "image",
                        e.target.value
                      )
                    }
                    placeholder="https://example.com/poster.jpg"
                  />

                  <label>
                    Click URL
                  </label>

                  <input
                    type="url"
                    value={
                      movie.url
                    }
                    onChange={(e) =>
                      handleRecommendedChange(
                        index,
                        "url",
                        e.target.value
                      )
                    }
                    placeholder="https://www.pvrcinemas.com/..."
                  />

                  {movie.image && (
                    <img
                      className="recommended-preview"
                      src={
                        movie.image
                      }
                      alt={`Movie ${
                        index + 1
                      } preview`}
                    />
                  )}

                </div>

              )
            )}

          </section>

        </form>

        {/* =============================================
            MESSAGE (inline, kept as a text fallback
            alongside the toast)
        ============================================= */}

        {message && (
          <div className="update-message">
            {message}
          </div>
        )}

      </div>

      {/* ===============================================
          SAVE BAR — fixed to the bottom of the screen,
          submits the form above via form="ticket-form"
      =============================================== */}

      <div className="save-bar">
        <button
          type="submit"
          form="ticket-form"
          className="save-button"
          disabled={loading}
        >
          {loading && <span className="spinner" />}
          {loading
            ? "SAVING..."
            : "SAVE / UPDATE TICKET"}
        </button>
      </div>

    </div>
  );
}

export default UpdateTicket;