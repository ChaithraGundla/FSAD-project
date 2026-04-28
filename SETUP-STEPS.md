# SafeHaven MySQL Setup

## 1. What is already done

- Frontend pages are ready.
- Node backend is ready in `server.js`.
- MySQL schema is ready in `setup.sql`.
- Forms are connected to backend API routes.
- Admin dashboard can load stored website requests.
- `.env` is already created with local defaults.

## 2. What is missing on this machine

At the time of setup, no MySQL server was reachable on:

- host: `localhost`
- port: `3306`

That means MySQL Workbench is installed, but the actual MySQL database server is not running or not installed locally.

## 3. Start or install MySQL Server

Use one of these paths:

1. If MySQL Server is already installed:
   - Open `Services` in Windows
   - Find a service like `MySQL80`
   - Start it

2. If MySQL Server is not installed:
   - Install MySQL Server 8.x
   - During setup, keep:
     - host: `localhost`
     - port: `3306`
     - user: `root`
     - password: `Chaithra@2006`

## 4. Create the database and tables

Open MySQL Workbench and run:

```sql
SOURCE C:/Users/CHITHRA/OneDrive/Desktop/FSAD project/setup.sql;
```

If `SOURCE` does not work in your editor tab, paste the contents of `setup.sql` directly and run it.

## 5. Start the website server

Open the `FSAD project` folder in VS Code, then run:

```powershell
npm start
```

Or double-click:

`start-safehaven.bat`

Open this URL in the browser:

`http://localhost:3000`

## 6. Test stored website data

Submit data from:

- `contact.html`
- `survivor-dashboard.html`

Then check:

### In the website

- Open `Admin Dashboard`
- Scroll to `Stored Website Requests`
- Click `Refresh`

### In MySQL Workbench

Run:

```sql
USE safehaven;

SELECT * FROM contact_requests ORDER BY created_at DESC;
SELECT * FROM support_requests ORDER BY created_at DESC;
SELECT * FROM anonymous_reports ORDER BY created_at DESC;
```

You can also open `queries.sql` in MySQL Workbench and run it directly.

## 7. If database connection fails

Check:

- MySQL service is running
- password matches `.env`
- port is `3306`
- user is `root`
