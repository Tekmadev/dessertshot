# Dessert Shot — EmailJS Templates

This folder holds the HTML email templates we paste into the EmailJS
dashboard. The files here are **not** loaded by the app — they're
source-of-truth copies of the markup pasted into EmailJS so we can
version-control and edit them locally.

## order-request.html

Notification email sent to the business inbox when a customer submits
the order form on the site.

### EmailJS dashboard settings

| Field        | Value                                          |
| ------------ | ---------------------------------------------- |
| Subject      | `New order request from {{from_name}}`         |
| To email     | `{{to_email}}`                                 |
| From name    | `Dessert Shot Website`                         |
| Reply-to     | `{{reply_to}}`                                 |

### Template variables

Sent by [`components/sections/OrderCTA.tsx`](../components/sections/OrderCTA.tsx):

| Variable           | Meaning                                           |
| ------------------ | ------------------------------------------------- |
| `{{to_email}}`     | Business inbox (defaults to `BUSINESS.email`)     |
| `{{from_name}}`    | Customer name                                     |
| `{{from_email}}`   | Customer email                                    |
| `{{phone}}`        | Customer phone (or `—` if blank)                  |
| `{{package_size}}` | Human label, e.g. "12 cups"                       |
| `{{flavors}}`      | Flavour notes                                     |
| `{{desired_date}}` | YYYY-MM-DD                                        |
| `{{notes}}`        | Additional notes (or `—`)                         |
| `{{reply_to}}`     | Same as `from_email`                              |

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
