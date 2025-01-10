![sessionblock_icon_128](https://github.com/user-attachments/assets/40e87bf8-9ee8-455e-ac0f-9f94fd5ba1bb)
# SessionBlock
### A chrome extension that blocks distracting sites while allowing for a limited number of temporary unblock sessions per day.

With this chrome extension, you can give yourself timed breaks that unlock all the distracting sites that you blocked. Stay productive without burning yourself out!

## Features:
* Configurable unblock duration and unblocks per day
* Choose what days of the week the extension is active
* Allow specific URL exceptions (such as a specific YouTube video)
* Customizable block page message

## Usage:
### Step 1:
Configure your settings. Choose how long you want each unblock session to be, how many per day, and which days of the week.
<br/>
<br/>
<img width="245" alt="sessionblock_settings" src="https://github.com/user-attachments/assets/30a6f68f-3c20-4c23-b8c7-b3fff5d8372e"/>

### Step 2:
Add the sites you want to block to the blocklist. Each site name should be formatted like  `youtube.com` or `twitch.tv` and should be separated by a new line each.
<br/>
<br/>
If there are specific URLs from a blocked site that you would still like to access, such as a specific YouTube video or Reddit post, you can add the full URL to the Allowed URL's list. These must be the full links, such as `https://www.youtube.com/watch?v=EerdGm-ehJQ`, and are also separated by a new line.
<br/>
<br/>
<img width="245" alt="sessionblock_blocklist" src="https://github.com/user-attachments/assets/6c1d243f-2da5-4693-9827-5737e9a1f557" />
<img width="245" alt="sessionblock_whitelist" src="https://github.com/user-attachments/assets/829bebe6-c783-400c-bd8b-5c8e82cb90c8" />

### Step 3:
**Make sure to save your changes!** After doing so, the sites you listed will be blocked. Now, whenever you feel like taking a break, you can click the Unblock button which will start the timer and temporarily grant you access to all your distractions!
<br/>
<br/>
<img width="241" alt="sessionblock_mainpage" src="https://github.com/user-attachments/assets/1f2b47a2-593b-41df-a944-36ec3d6e75a2" />
<img width="245" alt="sessionblock_unblocked" src="https://github.com/user-attachments/assets/8b003329-c7ea-47f9-861e-03f6760b658f" />

## Installation
I plan on putting this extension on the Chrome Web Store soon. For now, you can follow <a href="https://bashvlas.com/blog/install-chrome-extension-in-developer-mode" target="_blank">this guide<a> to manually install it into your chromium browser.

## Why does SessionBlock need access to my browsing history?
It is simply so that the blockpage can display the URL of the page that was just blocked.
<img width="500" alt="sessionblock_blockpage_history_permission" src="https://github.com/user-attachments/assets/b5e38779-6388-4cb5-97fe-98156c9d8474" />

