"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

import { IRISH_COUNTIES } from "@/lib/counties";
import styles from "./home-page.module.css";

type AuctionPreview = {
  id: string;
  title: string;
  short_description: string;
  location: string;
  category: string;
  county: string;
  image_url: string;
  starting_price: number;
  highest_bid: number | null;
  bid_count: number;
  ends_at: string;
};

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

export default function HomePage({ auctions, displayName }: { auctions: AuctionPreview[]; displayName: string | null }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [county, setCounty] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const filteredAuctions = hasSearched
    ? auctions.filter((auction) => {
        const searchText = `${auction.title} ${auction.location}`.toLowerCase();
        return (
          searchText.includes(query.trim().toLowerCase()) &&
          (!category || auction.category === category) &&
          (!county || auction.county === county)
        );
      })
    : auctions;

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
              {displayName ? (
                <Link className={styles.signupButton} href="/account" onClick={closeMenu}>My account</Link>
              ) : <>
                <Link className={styles.loginButton} href="/login" onClick={closeMenu}>Login</Link>
                <Link className={styles.signupButton} href="/signup" onClick={closeMenu}>Sign Up</Link>
              </>}
            </div>
          </nav>
          <div className={styles.navActions}>
            {displayName ? (
              <Link className={styles.signupButton} href="/account" aria-label={`Open ${displayName}'s profile`} title="Your profile">
                {displayName.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase()}
              </Link>
            ) : <>
              <Link className={styles.loginButton} href="/login">Login</Link>
              <Link className={styles.signupButton} href="/signup">Sign Up</Link>
            </>}
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
                {IRISH_COUNTIES.map((name) => (
                  <option value={name.toLowerCase()} key={name}>{name}</option>
                ))}
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
                <h2>Live Auctions</h2>
                <p>Local clearances currently open for bidding.</p>
              </div>
              <span className={styles.previewNotice}>{filteredAuctions.length} open</span>
            </div>
            <div className={styles.auctionGrid}>
              {filteredAuctions.map((auction) => {
                const currentBid = auction.highest_bid ?? auction.starting_price;
                const endsIn = Math.max(0, new Date(auction.ends_at).getTime() - Date.now());
                const daysLeft = Math.floor(endsIn / 86400000);
                const hoursLeft = Math.floor((endsIn % 86400000) / 3600000);

                return (
                  <article className={styles.auctionCard} key={auction.id}>
                    <Link className={styles.auctionCardLink} href={`/auctions/${auction.id}`}>
                      <div className={styles.auctionImage}>
                        <img src={auction.image_url} alt={auction.title} />
                        <span className={styles.countdown}>{daysLeft ? `${daysLeft}d ` : ""}{hoursLeft}h left</span>
                      </div>
                      <div className={styles.auctionCardContent}>
                        <h3>{auction.title}</h3>
                        <p className={styles.auctionLocation}>{auction.location}, Co. {auction.county}</p>
                        <p className={styles.auctionDescription}>{auction.short_description}</p>
                        <div className={styles.auctionMeta}>
                          <div>
                            <span className={styles.bidLabel}>{auction.highest_bid ? "Current bid" : "Starting bid"}</span>
                            <span className={styles.bidPrice}>{new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(currentBid)}</span>
                          </div>
                          <span className={styles.bidCount}>{auction.bid_count} {auction.bid_count === 1 ? "bid" : "bids"}</span>
                        </div>
                      </div>
                    </Link>
                  </article>
                );
              })}
            </div>
            {filteredAuctions.length === 0 && (
              <p className={styles.emptyResults} role="status">
                {auctions.length ? "No live auctions match those filters. Try another search." : "There are no live auctions yet. Check back soon or list a clearance of your own."}
              </p>
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