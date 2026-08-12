# Wedding Website

A single-page, self-contained wedding site for **mackenziewedding.co.uk**,
served by GitHub Pages.

> **Note:** currently staged in the `codejump` repo while the dedicated
> `mackenziewedding` repository is created. Its permanent home is that repo,
> with `index.html` at the root alongside a `CNAME` file containing
> `mackenziewedding.co.uk`.

Guests can:

- **RSVP** (accept / decline, party of up to 6)
- **Choose their menu** — starter, main and dessert per guest
- **Declare allergies** — common-allergen tick boxes plus a free-text notes box per guest
- Add a song request and a message

## Receiving RSVPs

GitHub Pages is static, so the form needs somewhere to send submissions.
Both options are configured at the top of the `<script>` block in `index.html`:

1. **Formspree (recommended).** Create a free form at [formspree.io](https://formspree.io),
   then set `FORM_ENDPOINT = "https://formspree.io/f/yourid"`. Submissions arrive in
   your inbox and the Formspree dashboard, exportable to CSV for the caterers.
2. **Email fallback (works today, no setup).** Leave `FORM_ENDPOINT` empty and set
   `RSVP_EMAIL` to your address. Submitting opens the guest's email app with the
   full RSVP pre-filled — they just press send.

## Customising

Everything lives in `index.html`. Search for and replace:

- **Names** — "Emma" / "James" / the `E & J` monograms
- **Date & RSVP deadline** — "12th June 2027" / "12th March 2027"
- **Venue** — "The Old Barn", address, accommodation note, Maps link
- **Schedule** — the four cards in the "The Day" section
- **Menu** — the display cards in the "The Menu" section *and* the `MENU` object
  in the script (that's what populates the RSVP form)
- **Contact email** — `RSVP_EMAIL` in the script and the footer `mailto:` link
