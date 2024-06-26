# Scrapbook-Style Project Management App (MVP Stage)

## Overview

This project is a scrapbook-style project management application tailored for artists. It aims to provide an intuitive and visually appealing way to manage projects, integrating both textual and visual elements. Setzen is German for "set" or "put." It's like putting all your thoughts into neat, retrievable places. I also liked how there was "zen" in the word. This is still an MVP, so most of the time was spent thinking about the rationale behind doing anything.

## Live Demo

Check out the deployed application: [https://setzen.vercel.app/](https://setzen.vercel.app/)

## Schema

<img src="https://github.com/MikelBai/scrapbook/assets/13091533/115a74a4-2a38-4f30-a8c6-df5a2017ef73" width="70%">

This took a bit more thinking than I expected. And I'm still thinking about it!

## What It Currently Looks Like

### Login Page:
![image](https://github.com/MikelBai/scrapbook/assets/13091533/ca45a1e3-66db-4989-9ed7-850ffe2bd770)

### Login Page (Mobile):
<img src="https://github.com/MikelBai/scrapbook/assets/13091533/7920ec02-4a31-4609-a7ab-3d9fa005620f" width="30%" alt="IMG_6309">

### Dashboard:
![image](https://github.com/MikelBai/scrapbook/assets/13091533/26c5dd2d-9219-4ca0-9bf6-180f9c22366e)

### Projects:
![image](https://github.com/MikelBai/scrapbook/assets/13091533/dc501869-ec4a-42ac-bcf6-7672438032c1)

## Vision

The goal of this project is to create a comprehensive tool that helps artists manage their projects with ease and creativity. Current key features include:

- **Visual and Textual Integration:** Incorporates images, sketches, and rich text to create detailed project descriptions and progress updates.
- **Dynamic Views:** Can toggle between different views, such as a calendar view and a scrapbook view, to visualize project timelines and progress.
- **Basic Functionality:** Has features like tagging, search, pagination, and authentication to provide a starting level of usability and user experience.

## Features Implemented

- **Deployment:** Deployed on Vercel for continuous integration.
- **Tagging and Search:** Implemented tagging and search functionality for efficient navigation through projects.
- **Dynamic Calendar View:** Introduced a calendar view that toggles between general tasks and day-by-day project progress.
- **Pagination and Accessibility:** Added pagination and accessibility features to enhance user experience.
- **Dynamic Rendering:** Implemented dynamic rendering to improve performance and interactivity.
- **Authentication:** Integrated OAuth for user authentication (temporarily not active; only the basic one is).

## Features in Progress

- **CRUD for Artifacts:** Implementing full CRUD functionality for artifacts (resources/images), including image uploads.
- **Layout for Scrapbook Concept:** Finalizing the layout for the scrapbook view and toggling between views.
- **OAuth Integration:** Re-integrating OAuth for secure user authentication.
- **Animations:** Planning and implementing animations to enhance user interaction.
- **Rich Text Editor:** Integrating Quill.js for a feature-rich Markdown editor, supporting various text formatting options.
- **Image and Sketch Integration:** Incorporating an HTML5 Canvas for seamless inclusion of artistic content.
- **Updating various placeholders:** The pictures for the artifacts need to be updated to at least be my own pictures.

## Future Plans

- **Embeds from Various Websites:** Integrate embeds from platforms like Pinterest, Twitter/X, and Pixiv.
- **Chatbox Command Interface:** Develop a chatbox-like way to add content, possibly using a CLI-type format for commands.
- **Expanded Tagging:** Enhance the tagging system for better project categorization and searchability.
- **Payment Integration:** Plan for Stripe/payment integration to charge for storage and additional features.
- **Cloud Storage Providers:** Integrate with cloud storage providers for extended storage options.
- **Account Setup:** Expand account setup options for a more personalized user experience.
- **Image Compression:** I think this would just be interesting to look into.
- **Mobile integration:** I want to be able to pull this up on my phone and send links here.

## Personal Note (Deeper vision?)

I store everything in a personal Discord server because I appreciate being able to access stuff from both PC and mobile, and the infinite storage (despite image compression). I like using channels and channel categories, the chat UI, and the automatic embeds for Twitter and other websites, which makes it easy to save references and pictures for inspiration. I want an app with similar functionality to Pinterest but with the ability to go offline, or at the very least browse without being bogged down by recommendation algorithms and layouts that seem to cater more to advertisers than to the end user.

This project will be deemed to have surpassed an MVP when I finalize a draft version of the scrapbook UI as well as complete the CRUD operations of images (artifacts), and sort out the data relationships between images and projects. AKA, when I can loosely start considering actually using it for personal use.

## Contributing

If you have ideas, suggestions, or improvements, feel free to create an issue or submit a pull request.

## The artwork source?

I drew the picture(s).
