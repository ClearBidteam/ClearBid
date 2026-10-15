"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

import styles from "./home-page.module.css";

const auctionPreviews = [
  {
    title: "House Clearance - Dundalk, Louth",
    location: "Dundalk, Co. Louth",
    category: "house",
    county: "louth",
    image: "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Living room furniture in a bright home",
    countdown: "2d 4h",
    bid: "€1,250",
    bids: "12 sample bids",
  },
  {
    title: "Garage Full of Tools - Cork City",
    location: "Cork City, Co. Cork",
    category: "garage",
    county: "cork",
    image: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Workshop tools arranged on a workbench",
    countdown: "1d 6h",
    bid: "€820",
    bids: "8 sample bids",
  },
  {
    title: "Shed & Garden Items - Galway",
    location: "Oranmore, Co. Galway",
    category: "garden",
    county: "galway",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Green plants and garden supplies",
    countdown: "3d 2h",
    bid: "€480",
    bids: "5 sample bids",
  },
  {
    title: "Antiques & Collectables - Kildare",
    location: "Naas, Co. Kildare",
    category: "antiques",
    county: "kildare",
    image: "https://images.unsplash.com/photo-1577083552431-6e5fd01988a5?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Colorful antique artwork",
    countdown: "5d 7h",
    bid: "€1,600",
    bids: "15 sample bids",
  },
];

const benefits = [
  { icon: "▣", title: "List in Minutes", text: "Upload photos, set a date and publish your auction." },
  { icon: "⌖", title: "Reach Local Buyers", text: "Connect with interested buyers throughout Ireland." },
  { icon: "↻", title: "Competitive Bids", text: "Let buyers compete for a fair price." },
  { icon: "▰", title: "Easy Collection", text: "Buyers collect according to your terms." },
];

const steps = [
  { title: "List Your Auction", text: "Add photographs, descriptions, collection details and auction dates." },
  { title: "Buyers Place Bids", text: "Local buyers compete online for the items they want." },
  { title: "Highest Bid Wins", text: "The highest eligible bidder wins when the auction ends." },
  { title: "Arrange Collection", text: "The buyer pays and collects during the agreed period." },
];

const categories = [
  { icon: "🏠", label: "House Clearance" },
  { icon: "🛠️", label: "Garage & Tools" },
  { icon: "🪑", label: "Furniture" },
  { icon: "🏺", label: "Antiques" },
  { icon: "🌿", label: "Garden & Shed" },
  { icon: "📦", label: "Collectables" },
];

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [county, setCounty] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const filteredAuctions = hasSearched
    ? auctionPreviews.filter((auction) => {
        const searchText = `${auction.title} ${auction.location}`.toLowerCase();
        return (
          searchText.includes(query.trim().toLowerCase()) &&
          (!category || auction.category === category) &&
          (!county || auction.county === county)
        );
      })
    : auctionPreviews;

  function searchAuctions(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setHasSearched(true);
    document.getElementById("auctions")?.scrollIntoView({ behavior: "smooth" });
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <div className={styles.site}>
      <header className={styles.header}>
        <div className={`${styles.container} ${styles.navbar}`}>
          <Link className={styles.logo} href="/" aria-label="ClearBid home">
            <span className={styles.logoMark} aria-hidden="true"><span /></span>
            <span>Clear<span>Bid</span></span>
          </Link>
          <nav className={`${styles.navLinks} ${menuOpen ? styles.navOpen : ""}`} aria-label="Main navigation">
            <a href="#auctions" onClick={closeMenu}>Browse Auctions</a>
            <a href="#how-it-works" onClick={closeMenu}>How It Works</a>
            <a href="#categories" onClick={closeMenu}>Categories</a>
            <a href="#footer" onClick={closeMenu}>Help</a>
            <div className={styles.mobileActions}>
              <Link className={styles.loginButton} href="/login" onClick={closeMenu}>Login</Link>
              <Link className={styles.signupButton} href="/signup" onClick={closeMenu}>Sign Up</Link>
            </div>
          </nav>
          <div className={styles.navActions}>
            <Link className={styles.loginButton} href="/login">Login</Link>
            <Link className={styles.signupButton} href="/signup">Sign Up</Link>
          </div>
          <button
            className={styles.menuToggle}
            type="button"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? "×" : "☰"}
          </button>
        </div>
      </header>

      <main>
        <section className={styles.hero}>
          <div className={`${styles.container} ${styles.heroInner}`}>
            <div className={styles.heroContent}>
              <div className={styles.heroBadge}>☘ Ireland&apos;s local auction marketplace</div>
              <h1>Clear it.<br />List it. <span>Sell it.</span></h1>
              <p className={styles.heroText}>The easiest way to sell a whole house, garage, shed or collection through competitive local bidding.</p>
              <div className={styles.heroButtons}>
                <a className={styles.primaryButton} href="#auctions">Browse Auctions</a>
                <Link className={styles.secondaryButton} href="/signup">List an Auction</Link>
              </div>
            </div>
          </div>
          <form className={styles.auctionSearch} onSubmit={searchAuctions}>
            <label className={styles.searchField}>
              <span className={styles.visuallyHidden}>Search auctions</span>
              <input value={query} onChange={(event) => setQuery(event.target.value)} type="search" placeholder="Search auctions..." />
            </label>
            <label className={styles.searchField}>
              <span className={styles.visuallyHidden}>Select category</span>
              <select value={category} onChange={(event) => setCategory(event.target.value)}>
                <option value="">All Categories</option>
                <option value="house">House Clearance</option>
                <option value="garage">Garage &amp; Tools</option>
                <option value="furniture">Furniture</option>
                <option value="antiques">Antiques</option>
                <option value="garden">Garden &amp; Shed</option>
              </select>
            </label>
            <label className={styles.searchField}>
              <span className={styles.visuallyHidden}>Select county</span>
              <select value={county} onChange={(event) => setCounty(event.target.value)}>
                <option value="">All Counties</option>
                <option value="galway">Galway</option>
                <option value="cork">Cork</option>
                <option value="louth">Louth</option>
                <option value="kildare">Kildare</option>
              </select>
            </label>
            <button className={styles.searchButton} type="submit">Search</button>
          </form>
        </section>

        <section className={styles.benefits} aria-label="Why ClearBid">
          <div className={`${styles.container} ${styles.benefitsGrid}`}>
            {benefits.map((benefit) => (
              <article className={styles.benefit} key={benefit.title}>
                <div className={styles.benefitIcon} aria-hidden="true">{benefit.icon}</div>
                <div><h2>{benefit.title}</h2><p>{benefit.text}</p></div>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.featuredAuctions} id="auctions">
          <div className={styles.container}>
            <div className={styles.sectionHeadingRow}>
              <div className={styles.sectionHeading}>
                <h2>Featured Auctions</h2>
                <p>Example listings showing how local clearances will appear.</p>
              </div>
              <span className={styles.previewNotice}>Preview listings</span>
            </div>
            <div className={styles.auctionGrid}>
              {filteredAuctions.map((auction) => (
                <article className={styles.auctionCard} key={auction.title}>
                  <div className={styles.auctionImage}>
                    <img src={auction.image} alt={auction.imageAlt} />
                    <span className={styles.countdown}>Example · {auction.countdown}</span>
                  </div>
                  <div className={styles.auctionCardContent}>
                    <h3>{auction.title}</h3>
                    <p className={styles.auctionLocation}>⌖ {auction.location}</p>
                    <div className={styles.auctionMeta}>
                      <div><span className={styles.bidLabel}>Sample bid</span><span className={styles.bidPrice}>{auction.bid}</span></div>
                      <span className={styles.bidCount}>{auction.bids}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            {filteredAuctions.length === 0 && (
              <p className={styles.emptyResults} role="status">No example listings match those filters. Try a different search.</p>
            )}
          </div>
        </section>

        <section className={styles.howItWorks} id="how-it-works">
          <div className={styles.container}>
            <div className={`${styles.sectionHeading} ${styles.centeredHeading}`}>
              <h2>How It Works</h2>
              <p>Four simple steps to clear your space and sell your items.</p>
            </div>
            <div className={styles.steps}>
              {steps.map((step, index) => (
                <article className={styles.step} key={step.title}>
                  <div className={styles.stepNumber}>{index + 1}</div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.categories} id="categories">
          <div className={styles.container}>
            <div className={styles.sectionHeading}>
              <h2>Browse by Category</h2>
              <p>Find the type of clearance or collection you are looking for.</p>
            </div>
            <div className={styles.categoryGrid}>
              {categories.map((item) => (
                <div className={styles.categoryCard} key={item.label}>
                  <div className={styles.categoryIcon} aria-hidden="true">{item.icon}</div>
                  <h3>{item.label}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.ctaSection}>
          <div className={`${styles.container} ${styles.ctaBox}`}>
            <div className={styles.ctaContent}>
              <h2>Ready to clear your space?</h2>
              <p>Create your account and get ready to reach interested buyers in your local area.</p>
              <Link className={styles.primaryButton} href="/signup">Get started</Link>
            </div>
            <div className={styles.ctaArtwork} aria-hidden="true"><span /><span /><span /></div>
          </div>
        </section>
      </main>

      <footer className={styles.footer} id="footer">
        <div className={`${styles.container} ${styles.footerGrid}`}>
          <div>
            <Link className={`${styles.logo} ${styles.footerLogo}`} href="/">
              <span className={styles.logoMark} aria-hidden="true"><span /></span>
              <span>Clear<span>Bid</span></span>
            </Link>
            <p className={styles.footerDescription}>Ireland&apos;s dedicated home-clearance auction platform. Bid it. Buy it. Clear it.</p>
          </div>
          <div className={styles.footerColumn}>
            <h2>Explore</h2>
            <a href="#auctions">Featured Auctions</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#categories">Categories</a>
          </div>
          <div className={styles.footerColumn}>
            <h2>Your Account</h2>
            <Link href="/signup">Create account</Link>
            <Link href="/login">Login</Link>
            <a href="mailto:hello@clearbid.ie">Contact</a>
          </div>
        </div>
        <div className={`${styles.container} ${styles.footerBottom}`}>
          <p>© 2026 ClearBid. All rights reserved.</p>
          <p>Made in Ireland 🇮🇪</p>
        </div>
      </footer>
    </div>
  );
}