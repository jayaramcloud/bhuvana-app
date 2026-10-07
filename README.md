# bhuvana-app

Your classroom website. Live at **https://bhuvana.preparingforinterviews.com**

It is plain HTML, CSS and JavaScript in the `public/` folder. No framework, no build step.
Pushing to the `master` branch publishes the site automatically (about 1-2 minutes).

```bash
git clone https://github.com/jayaramcloud/bhuvana-app.git
cd bhuvana-app
# edit files in public/, then:
git add -A && git commit -m "my change" && git push
```

Optional local preview: `npx wrangler dev` (needs Node.js).

Full walkthrough: https://github.com/jayaramcloud/hermes-cloudflare-classroom/blob/master/docs/STUDENT-GUIDE.md
