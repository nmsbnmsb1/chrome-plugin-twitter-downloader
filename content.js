/**
 * Content Script for Twitter/X Media Downloader Chrome Extension
 * Adapted from the original Greasemonkey script.
 * 代码来自: https://github.com/ChinaGodMan/UserScripts/blob/main/twitter-media-downloader/twitter-media-downloader.user.js
 */

//Constants
const UI_TEXT = {
    download: 'Download',
    completed: 'Download Completed',
    settings: 'Settings',
    skip_list_add: 'Skipped adding {user} to lists',
    dialog: {
        title: 'Download Settings',
        save: 'Save',
        save_history: 'Remember download history',
        clear_history: '(Clear)',
        clear_confirm: 'Clear download history?',
        show_sensitive: 'Always show sensitive content',
        pattern: 'File Name Pattern',
        target_list: 'Twitter List ID (for auto-add authors)'
    },
    enable_packaging: 'Package multiple files into a ZIP'
};
const lang = UI_TEXT;
const CSS = `
.tmd-down {margin-left: 12px; order: 99;}
.tmd-down:hover > div > div > div > div {color: rgba(29, 161, 242, 1.0);}
.tmd-down:hover > div > div > div > div > div {background-color: rgba(29, 161, 242, 0.1);}
.tmd-down:active > div > div > div > div > div {background-color: rgba(29, 161, 242, 0.2);}
.tmd-down:hover svg {color: rgba(29, 161, 242, 1.0);}
.tmd-down:hover div:first-child:not(:last-child) {background-color: rgba(29, 161, 242, 0.1);}
.tmd-down:active div:first-child:not(:last-child) {background-color: rgba(29, 161, 242, 0.2);}
.tmd-down.tmd-media {position: absolute; right: 0;}
.tmd-down.tmd-media > div {display: flex; border-radius: 99px; margin: 2px;}
.tmd-down.tmd-media > div > div {display: flex; margin: 6px; color: #fff;}
.tmd-down.tmd-media:hover > div {background-color: rgba(255,255,255, 0.6);}
.tmd-down.tmd-media:hover > div > div {color: rgba(29, 161, 242, 1.0);}
.tmd-down.tmd-media:not(:hover) > div > div {filter: drop-shadow(0 0 1px #000);}
.tmd-down g {display: none;}
.tmd-down.download g.download, .tmd-down.completed g.completed, .tmd-down.loading g.loading,.tmd-down.failed g.failed {display: unset;}
.tmd-down.loading svg {animation: spin 1s linear infinite;}
@keyframes spin {0% {transform: rotate(0deg);} 100% {transform: rotate(360deg);}}
.tmd-btn {display: inline-block; background-color: #1DA1F2; color: #FFFFFF; padding: 0 20px; border-radius: 99px;}
.tmd-tag {display: inline-block; background-color: #FFFFFF; color: #1DA1F2; padding: 0 10px; border-radius: 10px; border: 1px solid #1DA1F2;  font-weight: bold; margin: 5px;}
.tmd-btn:hover {background-color: rgba(29, 161, 242, 0.9);}
.tmd-tag:hover {background-color: rgba(29, 161, 242, 0.1);}
.tmd-notifier {display: none; position: fixed; left: 16px; bottom: 16px; color: #000; background: #fff; border: 1px solid #ccc; border-radius: 8px; padding: 4px;}
.tmd-notifier.running {display: flex; flex-direction: column; align-items: flex-start;}
.tmd-notifier-stats {display: flex; align-items: center;}
.tmd-notifier label {display: inline-flex; align-items: center; margin: 0 8px;}
.tmd-notifier label:before {content: " "; width: 32px; height: 16px; background-position: center; background-repeat: no-repeat;}
.tmd-notifier-stats label:nth-of-type(1):before {background-image:url("data:image/svg+xml;charset=utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 viewBox=%220 0 24 24%22><path d=%22M3,14 v5 q0,2 2,2 h14 q2,0 2,-2 v-5 M7,10 l4,4 q1,1 2,0 l4,-4 M12,3 v11%22 fill=%22none%22 stroke=%22%23666%22 stroke-width=%222%22 stroke-linecap=%22round%22 /></svg>");}
.tmd-notifier-stats label:nth-of-type(2):before {background-image:url("data:image/svg+xml;charset=utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 viewBox=%220 0 24 24%22><path d=%22M12,2 a1,1 0 0 1 0,20 a1,1 0 0 1 0,-20 M12,5 v7 h6%22 fill=%22none%22 stroke=%22%23999%22 stroke-width=%222%22 stroke-linejoin=%22round%22 stroke-linecap=%22round%22 /></svg>");}
.tmd-notifier-stats label:nth-of-type(3):before {background-image:url("data:image/svg+xml;charset=utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 viewBox=%220 0 24 24%22><path d=%22M12,0 a2,2 0 0 0 0,24 a2,2 0 0 0 0,-24%22 fill=%22%23f66%22 stroke=%22none%22 /><path d=%22M14.5,5 a1,1 0 0 0 -5,0 l0.5,9 a1,1 0 0 0 4,0 z M12,17 a2,2 0 0 0 0,5 a2,2 0 0 0 0,-5%22 fill=%22%23fff%22 stroke=%22none%22 /></svg>");}
.tmd-notifier-stats span {margin: 0 4px; color: #999;}
.tmd-notifier-message {display: block; width: 100%; margin-top: 4px; padding-top: 4px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #999; text-align: center;}
.tmd-notifier-message.show {color: #1DA1F2;}
.tmd-down.tmd-img {position: absolute; right: 0; bottom: 0; display: none !important;}
.tmd-down.tmd-img > div {display: flex; border-radius: 99px; margin: 2px; background-color: rgba(255,255,255, 0.6);}
.tmd-down.tmd-img > div > div {display: flex; margin: 6px; color: #fff !important;}
.tmd-down.tmd-img:not(:hover) > div > div {filter: drop-shadow(0 0 1px #000);}
.tmd-down.tmd-img:hover > div > div {color: rgba(29, 161, 242, 1.0);}
:hover > .tmd-down.tmd-img, .tmd-img.loading, .tmd-img.completed, .tmd-img.failed {display: block !important;}
.tweet-detail-action-item {width: 20% !important;}
/* show sensitive in media tab */
li[role="listitem"]>div>div>div>div:not(:last-child) {filter: none;}
li[role="listitem"]>div>div>div>div+div:last-child {display: none;}
`;
const SVG = `
<g class="download"><path d="M3,14 v5 q0,2 2,2 h14 q2,0 2,-2 v-5 M7,10 l4,4 q1,1 2,0 l4,-4 M12,3 v11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></g>
<g class="completed"><path d="M3,14 v5 q0,2 2,2 h14 q2,0 2,-2 v-5 M7,10 l3,4 q1,1 2,0 l8,-11" fill="none" stroke="#1DA1F2" stroke-width="2" stroke-linecap="round" /></g>
<g class="loading"><circle cx="12" cy="12" r="10" fill="none" stroke="#1DA1F2" stroke-width="4" opacity="0.4" /><path d="M12,2 a10,10 0 0 1 10,10" fill="none" stroke="#1DA1F2" stroke-width="4" stroke-linecap="round" /></g>
<g class="failed"><circle cx="12" cy="12" r="11" fill="#f33" stroke="currentColor" stroke-width="2" opacity="0.8" /><path d="M14,5 a1,1 0 0 0 -4,0 l0.5,9.5 a1.5,1.5 0 0 0 3,0 z M12,17 a2,2 0 0 0 0,4 a2,2 0 0 0 0,-4" fill="#fff" stroke="none" /></g>
`;
const APIRate = {

}
//Helpers
function formatDate(i, o, tz) {
    let d = new Date(i)
    if (tz) d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
    let m = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
    let v = {
        YYYY: d.getUTCFullYear().toString(),
        YY: d.getUTCFullYear().toString(),
        MM: d.getUTCMonth() + 1,
        MMM: m[d.getUTCMonth()],
        DD: d.getUTCDate(),
        hh: d.getUTCHours(),
        mm: d.getUTCMinutes(),
        ss: d.getUTCSeconds(),
        h2: d.getUTCHours() % 12,
        ap: d.getUTCHours() < 12 ? 'AM' : 'PM'
    }
    return o.replace(/(YY(YY)?|MMM?|DD|hh|mm|ss|h2|ap)/g, n => ('0' + v[n]).substr(-n.length))
}
function getCookie(name) {
    let cookies = {}
    document.cookie.split(';').filter(n => n.indexOf('=') > 0).forEach(n => {
        n.replace(/^([^=]+)=(.+)$/, (match, name, value) => {
            cookies[name.trim()] = value.trim()
        })
    })
    return name ? cookies[name] : cookies
}
function setStatus(btn, css, title, style) {
    if (css) {
        btn.classList.remove('download', 'completed', 'loading', 'failed')
        btn.classList.add(css)
    }
    if (title) btn.title = title
    if (style) btn.style.cssText = style
}
async function getStore(key, defaultValue) {
    const result = await chrome.storage.local.get([key]);
    if (result[key] === undefined) {
        // 如果没有值，写入默认值
        chrome.storage.local.set({ [key]: defaultValue });
        return defaultValue;
    }
    return result[key];
}
async function setStore(key, value) {
    await chrome.storage.local.set({ [key]: value });
}
async function addUserToList(userId, listId, userHandle, listName) {
    if (!listId) return false;

    let queryId = `EQ9KOQeashjfWnwFvcSSpg`;
    let base_url = `https://${host}/i/api/graphql/${queryId}/ListAddMember`;
    let cookies = getCookie();
    let headers = {
        'authorization': 'Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA',
        'content-type': 'application/json',
        'x-twitter-active-user': 'yes',
        'x-twitter-client-language': cookies.lang,
        'x-csrf-token': cookies.ct0
    };
    if (cookies.ct0.length == 32) headers['x-guest-token'] = cookies.gt;

    try {
        let response = await fetch(base_url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                "features": { "payments_enabled": false, "profile_label_improvements_pcf_label_in_post_enabled": true, "rweb_tipjar_consumption_enabled": true, "verified_phone_label_enabled": false, "responsive_web_graphql_skip_user_profile_image_extensions_enabled": false, "responsive_web_graphql_timeline_navigation_enabled": true },
                queryId,
                variables: {
                    'listId': listId,
                    'userId': userId
                }
            })
        });

        if (response.ok) {
            //console.log(`Successfully added user ${userId} to list ${listId}`);
            if (downloader?.enqueueMessage) {
                const normalizedHandle = userHandle ? userHandle.replace(/^@+/, '') : '';
                const displayUser = normalizedHandle ? `@${normalizedHandle}` : `User ${userId}`;
                const displayList = listName || listId;
                downloader.enqueueMessage(`${displayUser} added to list ${displayList}`);
            }
            return true;
        } else {
            console.error(`Failed to add user to list: ${response.status}`);
            return false;
        }
    } catch (error) {
        console.error('Error adding user to list:', error);
        return false;
    }
}

const tweetJSONStore = {}
function getTweetJSONStore(status_id) {
    if (!tweetJSONStore[status_id]) return
    let { json, ts } = tweetJSONStore[status_id]
    if (Date.now() - ts > 1000 * 60 * 3) return
    return json
}
function setTweetJSONStore(status_id, json) {
    tweetJSONStore[status_id] = { json, ts: Date.now() }
}
async function rwHistory(value) {
    let data = await getStore('download_history', [])
    if (value) {
        if (Array.isArray(value)) {
            data = data.concat(value)
            setStore('download_history', data)
        } else if (data.indexOf(value) < 0) {
            data.push(value)
            setStore('download_history', data)
        }
    }
    return data;
}
async function fetchJson(status_id) {
    //判断一下调用限制
    if (APIRate.remaining !== undefined && APIRate.remaining < 1) {
        let currentTime = new Date().toLocaleString(undefined, { hour12: false });
        if (currentTime < APIRate.resetTime) {
            throw new Error(`API rate limit exceeded; counter resets at ${APIRate.resetTime}`)
        }
    }
    //
    let base_url = `https://${host}/i/api/graphql/2ICDjqPd81tulZcYrtpTuQ/TweetResultByRestId`
    let variables = {
        'tweetId': status_id,
        'with_rux_injections': false,
        'includePromotedContent': true,
        'withCommunity': true,
        'withQuickPromoteEligibilityTweetFields': true,
        'withBirdwatchNotes': true,
        'withVoice': true,
        'withV2Timeline': true
    }
    let features = {
        'articles_preview_enabled': true,
        'c9s_tweet_anatomy_moderator_badge_enabled': true,
        'communities_web_enable_tweet_community_results_fetch': false,
        'creator_subscriptions_quote_tweet_preview_enabled': false,
        'creator_subscriptions_tweet_preview_api_enabled': false,
        'freedom_of_speech_not_reach_fetch_enabled': true,
        'graphql_is_translatable_rweb_tweet_is_translatable_enabled': true,
        'longform_notetweets_consumption_enabled': false,
        'longform_notetweets_inline_media_enabled': true,
        'longform_notetweets_rich_text_read_enabled': false,
        'premium_content_api_read_enabled': false,
        'profile_label_improvements_pcf_label_in_post_enabled': true,
        'responsive_web_edit_tweet_api_enabled': false,
        'responsive_web_enhance_cards_enabled': false,
        'responsive_web_graphql_exclude_directive_enabled': false,
        'responsive_web_graphql_skip_user_profile_image_extensions_enabled': false,
        'responsive_web_graphql_timeline_navigation_enabled': false,
        'responsive_web_grok_analysis_button_from_backend': false,
        'responsive_web_grok_analyze_button_fetch_trends_enabled': false,
        'responsive_web_grok_analyze_post_followups_enabled': false,
        'responsive_web_grok_image_annotation_enabled': false,
        'responsive_web_grok_share_attachment_enabled': false,
        'responsive_web_grok_show_grok_translated_post': false,
        'responsive_web_jetfuel_frame': false,
        'responsive_web_media_download_video_enabled': false,
        'responsive_web_twitter_article_tweet_consumption_enabled': true,
        'rweb_tipjar_consumption_enabled': true,
        'rweb_video_screen_enabled': false,
        'standardized_nudges_misinfo': true,
        'tweet_awards_web_tipping_enabled': false,
        'tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled': true,
        'tweetypie_unmention_optimization_enabled': false,
        'verified_phone_label_enabled': false,
        'view_counts_everywhere_api_enabled': true
    }
    let url = encodeURI(`${base_url}?variables=${JSON.stringify(variables)}&features=${JSON.stringify(features)}`)
    let cookies = getCookie()
    let headers = {
        'authorization': 'Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA',
        'x-twitter-active-user': 'yes',
        'x-twitter-client-language': cookies.lang,
        'x-csrf-token': cookies.ct0
    }
    if (cookies.ct0.length == 32) headers['x-guest-token'] = cookies.gt
    let tweet_detail = await fetch(url, { headers: headers }).then(result => {
        //提取api限制参数
        APIRate.limit = result.headers.get('x-rate-limit-limit');
        APIRate.remaining = result.headers.get('x-rate-limit-remaining');
        APIRate.reset = result.headers.get('x-rate-limit-reset');
        APIRate.resetTime = new Date(parseInt(APIRate.reset) * 1000).toLocaleString(undefined, {
            hour12: false
        });
        return result.json()
    })
    let tweet_result = tweet_detail.data.tweetResult.result
    return tweet_result.tweet || tweet_result
}
async function generateMarkdown(tweet_id, fetch = true) {
    if (!fetch) return `[Tweet] - ${tweet_id} (https://x.com/i/web/status/${tweet_id})`
    let json = await fetchJson(tweet_id)
    let tweet = json.quoted_status_result?.result?.legacy?.media
        || json.quoted_status_result?.result?.legacy
        || json.legacy
    let user = json.core.user_results.result.legacy
    let invalid_chars = { '\\': '＼', '\/': '／', '\|': '｜', '<': '＜', '>': '＞', ':': '：', '*': '＊', '?': '？', '"': '＂', '\u200b': '', '\u200c': '', '\u200d': '', '\u2060': '', '\ufeff': '', '🔞': '' }
    let user_name = user.name.replace(/([\\/|*?:"\u200b-\u200d\u2060\ufeff]|🔞)/g, v => invalid_chars[v])
    let full_text = tweet.full_text.split('\n').join(' ').replace(/\s*https:\/\/t\.co\/\w+/g, '').replace(/[\\/|<>*?:"\u200b-\u200d\u2060\ufeff]/g, v => invalid_chars[v])
    return `[${user_name} (@${user.screen_name})](https://x.com/i/web/status/${tweet_id})\n>  ${full_text}\n`
}
//
//let filename = 'twitter_{user-name}(@{user-id})_{date-time}_{status-id}_{file-type}';
let filename = '{date-time}_{file-type}';
let host, history;
//初始化
async function init() {
    host = location.hostname;
    history = await rwHistory()
    document.head.insertAdjacentHTML('beforeend', '<style>' + CSS + '</style>')
    let observer = new MutationObserver(ms => {
        return ms.forEach(m => m.addedNodes.forEach(node => detect(node)))
    })
    observer.observe(document.body, { childList: true, subtree: true })
}
function detect(node) {
    let article = node.tagName == 'ARTICLE' && node || node.tagName == 'DIV' && (node.querySelector('article') || node.closest('article'))
    if (article) addButtonTo(article)
    let listitems = node.tagName == 'LI' && node.getAttribute('role') == 'listitem' && [node] || node.tagName == 'DIV' && node.querySelectorAll('li[role="listitem"]')
    if (listitems) addButtonToMedia(listitems)
}
function addButtonTo(article) {
    if (article.dataset.detected) return
    //
    article.dataset.detected = 'true';
    let media_selector = [
        'a[href*="/photo/1"]',
        'div[role="progressbar"]',
        'button[data-testid="playButton"]',
        'a[href="/settings/content_you_see"]', //hidden content
        'div.media-image-container', // for tweetdeck
        'div.media-preview-container', // for tweetdeck
        'div[aria-labelledby]>div:first-child>div[role="button"][tabindex="0"]', //for audio (experimental)
        'div[aria-labelledby]>div:first-child' //for audio (experimental)
    ];
    let media = article.querySelector(media_selector.join(','));
    if (media) {
        let status_id = article.querySelector('a[href*="/status/"]').href.split('/status/').pop().split('/').shift()
        let btn_group = article.querySelector('div[role="group"]:last-of-type, ul.tweet-actions, ul.tweet-detail-actions')
        let btn_share = Array.from(btn_group.querySelectorAll(':scope>div>div, li.tweet-action-item>a, li.tweet-detail-action-item>a')).pop().parentNode
        let btn_down = btn_share.cloneNode(true)
        btn_down.querySelector('button').removeAttribute('disabled')
        btn_down.querySelector('svg').innerHTML = SVG
        let is_exist = history.indexOf(status_id) >= 0
        setStatus(btn_down, 'tmd-down')
        setStatus(btn_down, is_exist ? 'completed' : 'download', is_exist ? lang.completed : lang.download)
        btn_group.insertBefore(btn_down, btn_share.nextSibling)
        btn_down.onclick = (event) => click(btn_down, status_id, is_exist, undefined, event)
        let btn_show = article.querySelector('div[aria-labelledby] div[role="button"][tabindex="0"]:not([data-testid]) > div[dir] > span > span')
        if (btn_show) btn_show.click()
    }
}
function addButtonToMedia(listitems) {
    listitems.forEach(li => {
        if (li.dataset.detected) return
        li.dataset.detected = 'true'
        let status_id = li.querySelector('a[href*="/status/"]')?.href.split('/status/').pop().split('/').shift()
        if (!status_id) return;
        let is_exist = history.indexOf(status_id) >= 0
        let btn_down = document.createElement('div')
        btn_down.innerHTML = '<div><div><svg viewBox="0 0 24 24" style="width: 18px; height: 18px;">' + SVG + '</svg></div></div>'
        btn_down.classList.add('tmd-down', 'tmd-media')
        setStatus(btn_down, is_exist ? 'completed' : 'download', is_exist ? lang.completed : lang.download)
        li.appendChild(btn_down)
        btn_down.onclick = (event) => click(btn_down, status_id, is_exist, undefined, event)
    })
}
async function click(btn, status_id, is_exist, index, evt) {
    if (btn.classList.contains('loading')) return
    //
    setStatus(btn, 'loading')
    //
    let out = (await getStore('filename', filename)).split('\n').join('')
    let middleName = ``;
    const skipAutoAdd = evt?.altKey === true;
    let info = await getTweet(status_id, index, out)
    if (typeof info === 'string') {
        setStatus(btn, 'failed', info)
        return
    }
    //
    //如果是回复推文
    let isReply = info.tweet.in_reply_to_status_id_str !== undefined
    if (!isReply) {
        let startName = info.author
        if (startName.startsWith('.')) startName = `_${startName}`
        middleName = `${startName}/${status_id}_`;
        // Add user to list if it's a main tweet (not a reply)
        if (!skipAutoAdd) {
            getStore('twitter_lists', []).then(twitterLists => {
                //console.log(twitterLists)
                if (twitterLists && twitterLists.length > 0) {
                    let userId = info.userId;
                    // Add user to all enabled lists
                    const enabledLists = twitterLists.filter(list => list.enabled);
                    enabledLists.forEach(list => {
                        if (list.id.trim()) {
                            addUserToList(userId, list.id.trim(), info['user-id'], list.name);
                        }
                    });
                }
            });
        } else if (downloader?.enqueueMessage) {
            const normalizedHandle = (info['user-id'] || '').replace(/^@+/, '');
            const displayUser = normalizedHandle ? `@${normalizedHandle}` : info.author;
            downloader.enqueueMessage(lang.skip_list_add.replace('{user}', displayUser));
        }
    } else {
        //抓取主贴信息
        let mainInfo = await getTweet(info.tweet.in_reply_to_status_id_str, undefined, out, false)
        if (typeof mainInfo === 'string') {
            let startName = info.author
            if (startName.startsWith('.')) startName = `_${startName}`
            middleName = `${startName}/${status_id}_`;
        } else {
            let startName = mainInfo.author
            if (startName.startsWith('.')) startName = `_${startName}`
            middleName = `${startName}/${info.tweet.in_reply_to_status_id_str}_re_`;
        }
    }
    //
    let save_history = await getStore('save_history', true)
    let enable_packaging = await getStore('enable_packaging', false)
    //下载推文
    {
        //console.log(await generateMarkdown(status_id))
    }
    //下载多媒体
    {
        let tasks = info.medias.map((media, i) => {
            info.url = media.type == 'photo' ? media.media_url_https + ':orig' : media.video_info.variants.filter(n => n.content_type == 'video/mp4').sort((a, b) => b.bitrate - a.bitrate)[0].url
            info.file = info.url.split('/').pop().split(/[:?]/).shift()
            info['file-name'] = info.file.split('.').shift()
            info['file-ext'] = info.file.split('.').pop()
            info['file-type'] = media.type.replace('animated_', '')
            info.out = (out.replace(/\.?\{file-ext\}/, '') + ((info.medias.length > 1 || index) && !out.match('{file-name}') ? '-' + (index ? index - 1 : i) : '') + '.{file-ext}').replace(/\{([^{}:]+)(:[^{}]+)?\}/g, (match, name) => info[name])
            return { url: info.url, name: `${middleName}${info.out}`, info }
        })
        if (tasks.length)
            downloader.add(tasks, btn, save_history, is_exist, status_id, enable_packaging)
    }
}
async function getTweet(status_id, index, out, checkMedia = true) {
    //加一个缓存，避免多次调用api,但是仅缓存主推文的内容
    let json = getTweetJSONStore(status_id)
    if (!json) {
        try {
            json = await fetchJson(status_id);
        } catch (e) {
            return e.message
        }
    }
    // console.log(json.quoted_status_result?.result?.legacy?.media)
    // console.log(json.quoted_status_result?.result?.legacy)
    // console.log(json.legacy)
    let tweet = json.quoted_status_result?.result?.legacy?.media//此媒体存在,属于引用推文
        || json.quoted_status_result?.result?.legacy //引用
        || json.legacy //本体
    if (!tweet) {
        return 'UNAVALIABLE_TWEET'
    }
    if (!tweet.in_reply_to_status_id_str) setTweetJSONStore(status_id, json)
    //
    let medias = []
    if (checkMedia) {
        if (json?.card) {
            //console.log(json)
            //setStatus(btn, 'failed', 'This tweet contains a link, which is not supported by this script.')
            return 'This tweet contains a link, which is not supported by this script.'
        }
        //medias = tweet.extended_entities && tweet.extended_entities.media
        medias.push(...json.quoted_status_result?.result?.legacy?.media?.extended_entities?.media || [])
        medias.push(...json.quoted_status_result?.result?.legacy.extended_entities?.media || [])
        medias.push(...json.legacy?.extended_entities?.media || [])
        if (!Array.isArray(medias)) {
            //setStatus(btn, 'failed', 'MEDIA_NOT_FOUND')
            return 'MEDIA_NOT_FOUND'
        }
        if (index) medias = [medias[index - 1]]
        if (medias.length <= 0) {
            //setStatus(btn, 'failed', 'MEDIA_NOT_FOUND')
            return 'MEDIA_NOT_FOUND'
        }
    }
    //
    let user = json.core.user_results.result.legacy
    let userId = json.core.user_results.result.rest_id
    let invalid_chars = { '\\': '＼', '\/': '／', '\|': '｜', '<': '＜', '>': '＞', ':': '：', '*': '＊', '?': '？', '"': '＂', '\u200b': '', '\u200c': '', '\u200d': '', '\u200e': '', '\u2060': '', '\ufeff': '', '🔞': '' }
    let datetime = out.match(/\{date-time(-local)?:[^{}]+\}/) ? out.match(/\{date-time(?:-local)?:([^{}]+)\}/)[1].replace(/[\\/|<>*?:"]/g, v => invalid_chars[v]) : 'YYYYMMDDhhmmss'
    let info = { tweet, medias, user, userId }
    info['status-id'] = status_id
    info['user-name'] = user.name.replace(/([\\/|*?:"\u200b-\u200f\u2060\ufeff]|🔞)/g, v => invalid_chars[v])
    info['user-id'] = user.screen_name
    info['date-time'] = formatDate(tweet.created_at, datetime)
    info['date-time-local'] = formatDate(tweet.created_at, datetime, true)
    info['full-text'] = tweet.full_text.split('\n').join(' ').replace(/\s*https:\/\/t\.co\/\w+/g, '').replace(/[\\/|<>*?:"\u200b-\u200f\u2060\ufeff]/g, v => invalid_chars[v])
    info.author = `${info['user-name'] || 'noname'}(@${info['user-id']})`
    info.simple_content = Array.from(info['full-text']).slice(0, 16).join('').replace(/\./g, '').trim()

    return info;
}
const downloader = (function () {
    let tasks = [], thread = 0, failed = 0, notifier, has_failed = false
    let notifierStats, notifierThreadLabel, notifierRateLabel, notifierFailedLabel, failedSeparator
    let messageContainer
    const messageQueue = []
    let messageActive = false
    let notifierPersistent = false

    function showNoMessage() {
        if (!messageContainer) return
        messageContainer.textContent = 'No messages'
        messageContainer.classList.remove('show')
    }

    function ensureNotifier() {
        if (!notifier) {
            notifier = document.createElement('div')
            notifier.title = 'Twitter Media Downloader'
            notifier.classList.add('tmd-notifier')

            notifierStats = document.createElement('div')
            notifierStats.classList.add('tmd-notifier-stats')
            notifier.appendChild(notifierStats)

            notifierThreadLabel = document.createElement('label')
            notifierRateLabel = document.createElement('label')
            const separator = document.createElement('span')
            separator.textContent = '|'

            notifierStats.appendChild(notifierThreadLabel)
            notifierStats.appendChild(separator)
            notifierStats.appendChild(notifierRateLabel)

            messageContainer = document.createElement('div')
            messageContainer.classList.add('tmd-notifier-message')
            notifier.appendChild(messageContainer)
            showNoMessage()

            document.body.appendChild(notifier)
        }
    }

    function resetFailureIndicators() {
        if (notifierFailedLabel) {
            notifierFailedLabel.remove()
            notifierFailedLabel = null
        }
        if (failedSeparator) {
            failedSeparator.remove()
            failedSeparator = null
        }
    }

    function ensureFailureControls() {
        if (!notifierStats) return
        if (!failedSeparator) {
            failedSeparator = document.createElement('span')
            failedSeparator.textContent = '|'
            notifierStats.appendChild(failedSeparator)
        }
        if (!notifierFailedLabel) {
            notifierFailedLabel = document.createElement('label')
            notifierStats.appendChild(notifierFailedLabel)
            notifierFailedLabel.onclick = () => {
                failed = 0
                has_failed = false
                resetFailureIndicators()
                updateNotifier()
            }
        }
    }

    function updateNotifier() {
        ensureNotifier()
        if (!notifierThreadLabel || !notifierRateLabel) return

        notifierThreadLabel.innerText = thread
        const remainingText = APIRate.remaining !== undefined ? APIRate.remaining : '-'
        const resetText = APIRate.resetTime || '-'
        notifierRateLabel.innerText = `${remainingText}(${resetText})`

        if (failed > 0 && !has_failed) {
            has_failed = true
            ensureFailureControls()
        } else if (failed === 0 && has_failed) {
            has_failed = false
            resetFailureIndicators()
        }

        if (failed > 0 && notifierFailedLabel) {
            notifierFailedLabel.innerText = failed
        }

        if (!notifierPersistent && (thread > 0 || tasks.length > 0 || failed > 0 || messageActive || messageQueue.length > 0)) {
            notifierPersistent = true
        }

        if (notifierPersistent || thread > 0 || tasks.length > 0 || failed > 0 || messageActive) {
            notifier.classList.add('running')
        } else if (!notifierPersistent && notifier) {
            notifier.classList.remove('running')
        }
    }

    function processMessageQueue() {
        if (messageActive) return
        const nextMessage = messageQueue.shift()
        if (!nextMessage) {
            showNoMessage()
            updateNotifier()
            return
        }

        ensureNotifier()
        if (messageContainer) {
            messageContainer.textContent = nextMessage
            messageContainer.classList.add('show')
        }
        messageActive = true
        if (notifier) notifier.classList.add('running')

        setTimeout(() => {
            if (messageContainer) {
                showNoMessage()
            }
            messageActive = false
            processMessageQueue()
        }, 1500)
    }

    function enqueueMessage(message) {
        if (!message) return
        notifierPersistent = true
        messageQueue.push(message)
        processMessageQueue()
    }

    function downloadTask(task, btn, save_history, is_exist, status_id) {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({ action: "download", task }, (response) => {
                if (response?.status === "resolved") {
                    thread--
                    tasks = tasks.filter(t => t.url !== task.url)
                    setStatus(btn, 'completed', lang.completed)
                    if (save_history && !is_exist) {
                        history.push(status_id)
                        rwHistory(status_id)
                    }
                    updateNotifier()
                    resolve()
                } else if (response?.status === "rejected") {
                    thread--
                    failed++
                    tasks = tasks.filter(t => t.url !== task.url)
                    setStatus(btn, 'failed', response.error)
                    updateNotifier()
                    console.log(response.error, task)
                    reject(response.error)
                }
                resolve()
            })
        })
    }

    function addTasks(taskList, btn, save_history, is_exist, status_id, enable_packaging) {
        tasks.push(...taskList)
        updateNotifier()
        if (enable_packaging) {
            let zip = new JSZip()
            let completedCount = 0
            taskList.forEach(task => {
                thread++
                updateNotifier()
                fetch(task.url)
                    .then(response => response.blob())
                    .then(blob => {
                        zip.file(task.name, blob)
                        tasks = tasks.filter(t => t.url !== task.url)
                        thread--
                        updateNotifier()
                        completedCount++
                        if (completedCount === taskList.length) {
                            zip.generateAsync({ type: 'blob' }).then(content => {
                                let a = document.createElement('a')
                                a.href = URL.createObjectURL(content)
                                a.download = `${taskList[0].name}.zip`
                                a.click()
                                setStatus(btn, 'completed', lang.completed)
                                if (save_history && !is_exist) {
                                    history.push(status_id)
                                    rwHistory(status_id)
                                }
                                updateNotifier()
                            })
                        }
                    })
                    .catch(error => {
                        failed++
                        tasks = tasks.filter(t => t.url !== task.url)
                        setStatus(btn, 'failed', error.message)
                        updateNotifier()
                    })
            })
        } else {
            taskList.forEach(task => {
                thread++
                updateNotifier()
                downloadTask(task, btn, save_history, is_exist, status_id).catch(e => {
                    if (e === 'Invalid filename') {
                        setTimeout(() => {
                            thread++
                            tasks.push(task)
                            updateNotifier()
                            task.saveAs = true
                            navigator.clipboard.writeText(task.name)
                            downloadTask(task, btn, save_history, is_exist, status_id).catch(() => {
                            })
                        }, 1000)
                    }
                })
            })
        }
    }

    return {
        add: addTasks,
        download: downloadTask,
        update: updateNotifier,
        enqueueMessage
    }
})()

// Initialize the script after the DOM is ready
// Using a small delay to ensure the page layout is somewhat stable
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(init, 500));
} else {
    setTimeout(init, 500);
}
