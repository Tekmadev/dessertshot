# Order flow setup (Step 3)

The order form now sends everything through the server: it checks the order, prices it, saves it to Supabase, emails the owner and sends the customer an auto-reply. The customer then lands on `/order/thanks`. This page lists the one-time setup only the account owners can do. **Never paste a key into chat or commit it.**

There are two phases, **before** and **after** the new code is deployed, so that the owner keeps getting order emails the whole time. The live site sends from the browser today. The new code sends from the server and keeps the old template's variable names, so the existing owner template works with both.

## Phase 1 — before deploying

Nothing here changes what the live site does.

### EmailJS (dashboard.emailjs.com)

1. **Account → Security:** turn on **"Allow EmailJS API for non-browser applications"** (it's off by default; without it every server send fails with 403). Copy the **Private Key**, but **don't turn on private-key enforcement yet**: the live site sends from the browser without it.
2. **Email Services:** make sure **dessertshot.ca@gmail.com** is the connected sending service.
3. **Owner template:** set **To Email** to **dessertshot.ca@gmail.com**, typed in (not `{{to_email}}`). Both the live site and the new code only ever send it there, so nothing changes, but the template IDs are in the live site's public JavaScript, and once step 1 allows server-style calls, a typed-in address means nobody can redirect this template to someone else.
4. **Customer auto-reply template** (new; the free plan allows two templates):
   - To Email: `{{to_email}}` · From Name: `{{from_name}}` · Reply To: `{{reply_to}}` · Subject: `{{subject}}`
   - Body (HTML), for example:

     ```html
     <p>Hi {{to_name}},</p>
     <p>Thanks for your order request. Here is what we received:</p>
     <div>{{{order_summary_html}}}</div>
     <p>{{next_steps}}</p>
     <p>{{allergen_notice}}</p>
     <p>Questions or changes? Just reply to this email.<br>Dessert Shot by Farhana · {{business_email}}</p>
     ```
   - Don't also use the owner template's "Auto-Reply / Linked Template" tab: the site sends this email itself, and a linked template would send a second one.
5. Optional: in each template's settings, turn off **Email History** if you'd rather EmailJS didn't keep a copy of customer details (7 days on the free plan).

### Supabase (supabase.com/dashboard)

6. **Project Settings → API Keys:** create a **secret key** (`sb_secret_…`) for the website. It bypasses row level security, so it only ever goes in Vercel's server environment.

### Vercel (Project → Settings → Environment Variables)

7. Add for **Production and Preview** (no `NEXT_PUBLIC_` prefix, so they never reach the browser):

   | Name | Value |
   |---|---|
   | `SUPABASE_SECRET_KEY` | the Supabase secret key |
   | `EMAILJS_PRIVATE_KEY` | the EmailJS private key |
   | `EMAILJS_CUSTOMER_TEMPLATE_ID` | the auto-reply template's ID |

   Already set and still used: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_EMAILJS_SERVICE_ID`, `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID`, `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY` (`EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID` and `EMAILJS_PUBLIC_KEY` override them if you prefer server-only names).

   Optional: `RATE_LIMIT_SECRET`, any long random string, used to hash IPs and emails for the spam limits (defaults to the Supabase secret key). `EMAILJS_AUTOREPLY_MONTHLY_LIMIT`: how many auto-replies may go out in 30 days (default 80; raise it on a paid EmailJS plan).

## Deploy

8. Deploy the new code (first as a Vercel preview, then to production when approved).

## Phase 2 — after the new code is live

9. **EmailJS → Account → Security:** turn **on** private-key enforcement. From now on only the server (which holds the private key) can send. The template IDs and public key the old site shipped in its public JavaScript become useless to anyone else.
10. **EmailJS → owner template**, in the same sitting:
    - Reply To: `{{reply_to}}` · Subject: `{{subject}}`
    - Body: paste the updated `email-templates/order-request.html` (it adds the event type and the order reference), or use the plain summary `<div>{{{order_summary_html}}}</div>`. With the old design, the event type the customer picked never reaches the inbox.
    - Use the raw-HTML summary only once step 9 is done.
11. **Supabase → SQL Editor:** paste and run `supabase/migrations/004_order_details.sql`. It adds the structured order fields, closes public write access to the orders tables and creates the private spam-limit table. Don't run it before the new code with the secret key is live: until then, orders would still arrive by email but wouldn't be saved.
12. `NEXT_PUBLIC_BUSINESS_EMAIL` is no longer used and can be deleted from Vercel.

## Test (on the preview first)

Place one clearly labelled test order (for example the name "TEST ORDER, please ignore"). Check that:
- the owner email arrives with the full summary, and replying goes to the customer address;
- the auto-reply arrives at the customer address, showing the order but not the notes or street address;
- the order appears in Supabase → Table Editor → `orders` (after step 10, with `event_type`, `delivery_postal_code` and `source` filled in) and its flavours in `order_items`;
- the total on `/order/thanks` matches the email and the database row.

There is only one database, so the test order lands in the live table. Delete it there afterwards.

## Template variables

Both templates: `order_ref`, `order_summary` (plain text), `order_summary_html` (escaped, use triple braces), `cup_size`, `tier`, `package_size`, `flavors`, `estimated_total`, `total_label`, `desired_date`, `urgency`, `fulfillment`, `event_type`, `to_email`, `from_name` (the customer's name in the owner email, "Dessert Shot" in the auto-reply), `reply_to`, `subject`.

Owner template only: `from_email`, `phone`, `notes`, `delivery_address`, `postal_code`.

Customer template only: `to_name` (first name), `business_email`, `next_steps`, `allergen_notice`. The auto-reply goes to an address nobody has verified, so it never repeats the notes, phone or street address the sender typed.

Quota: each order uses **2 requests** (owner + customer). The free plan allows 200 a month. Auto-replies stop after 80 in 30 days (or 5 a day to one inbox), leaving at least 120 requests for the owner's notifications; orders past that are still saved and emailed to the owner, and the thanks page tells the customer to watch for the confirmation instead. A flood from many connections can still use up the owner's share: if EmailJS warns about the quota, check new orders in Supabase → `orders`, and consider a paid plan.

## Local development

`npm run dev` never saves or emails orders: it checks them and shows the thanks page, nothing more (there is only one database and one inbox). To test the real thing locally, set `ORDER_LIVE=1`. `ORDER_DRY_RUN=1` forces the safe mode on any deployment.

## How it behaves

| Situation | What happens |
|---|---|
| Valid order | Saved, owner emailed, customer auto-reply, thanks page with the server's summary and total |
| Invalid order | Field messages on the form; nothing saved or sent |
| Hidden "website" field filled (a bot) | Looks like success; nothing saved or sent |
| Posted from another website | Refused |
| More than 5 requests an hour or 10 a day from one connection | "Please wait a little", with the email address |
| More than 5 a day to one inbox, or 80 auto-replies in 30 days | Saved and emailed to the owner; no auto-reply; the thanks page says so |
| Retried after a dropped connection | Recognised as the same order; not saved or emailed twice |
| Database down or slow (4 s), email works | Success; the owner has the email |
| Owner email fails (retried once), database works | Success; the order is in the `orders` table and the server log says so |
| Both fail | Error with the email address to write to instead; no auto-reply |
