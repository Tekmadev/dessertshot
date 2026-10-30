# Dessert Shot — EmailJS Templates

This folder holds the HTML email templates we paste into the EmailJS
dashboard. The files here are **not** loaded by the app — they're
source-of-truth copies of the markup pasted into EmailJS so we can
version-control and edit them locally.

## order-request.html

The owner's notification for each order request. Since Step 3 it is sent by
the **server** (`lib/server/emailjs.ts`), with variables built in
[`lib/order-email.ts`](../lib/order-email.ts). The variable names this
template uses are unchanged, so it keeps working. Full setup, including the
customer auto-reply template: [`docs/order-setup.md`](../docs/order-setup.md).

### EmailJS dashboard settings

| Field        | Value                                                     |
| ------------ | --------------------------------------------------------- |
| Subject      | `{{subject}}` (e.g. "Order request DS-1A2B3C4D: 48 Dessert Cups (5 oz), Saturday, December 12, 2026") |
| To email     | `dessertshot.ca@gmail.com`, typed in (see the setup doc)  |
| From name    | `Dessert Shot Website`                                    |
| Reply-to     | `{{reply_to}}`                                            |

### Template variables

| Variable             | Meaning                                                   |
| -------------------- | --------------------------------------------------------- |
| `{{from_name}}`      | Customer name                                             |
| `{{from_email}}`     | Customer email                                            |
| `{{phone}}`          | Customer phone (or `—`)                                   |
| `{{cup_size}}`       | e.g. "Dessert Cups (5 oz)"                                |
| `{{tier}}`           | Classic, Premium or Mixed                                 |
| `{{package_size}}`   | e.g. "48 cups · $229" (estimated total, before delivery)  |
| `{{flavors}}`        | e.g. "Mango Dream ×24 (Dairy), Dubai Chocolate ×24 (Dairy, Tree nuts)" |
| `{{desired_date}}`   | e.g. "Saturday, December 12, 2026"                        |
| `{{urgency}}`        | Standard or urgent, worked out from the date              |
| `{{fulfillment}}`    | Pickup, or delivery with the address and postal code      |
| `{{notes}}`          | Customer notes (or `—`)                                   |
| `{{order_ref}}`, `{{event_type}}`, `{{estimated_total}}`, `{{delivery_address}}`, `{{postal_code}}`, `{{order_summary}}`, `{{{order_summary_html}}}` | New since Step 3 |

### Brand palette (matches [`globals.css`](../app/globals.css))

| Token        | Hex       | Usage                |
| ------------ | --------- | -------------------- |
| `bone`       | `#fce4e7` | Outer blush bg       |
| `bone-soft`  | `#fff0f3` | Card surface         |
| `cream`      | `#fff8fa` | Inner cards          |
| `ink`        | `#3a1d28` | Body text            |
| `ember`      | `#d04864` | Accent / CTA         |
| `ember-soft` | `#ea8298` | Soft italics         |

### Email-safe notes

- Table-based layout (Outlook desktop friendly)
- Inline styles on every cell (Gmail strips `<style>` when forwarded)
- Web-safe font stack with Google Fonts upgrade for clients that
  support them (Apple Mail, iOS Mail, Gmail web). Outlook falls back
  to Georgia / system fonts cleanly.

### Updating the template

1. Edit `order-request.html` here first.
2. Preview locally (open in browser or the editor's preview panel).
3. Copy the entire file contents into the EmailJS template editor's
   **Content** tab and save.
