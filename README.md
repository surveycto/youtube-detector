# YouTube detector

<img src="extras/readme-images/text_box_revealed.png" width="300px">

|<img src="extras/readme-images/blank_box.png" width="100px">|<img src="extras/readme-images/main_choice.png" width="100px">|
|:---:|:---:|
|Waiting for text||Main choice selected|

## Description

This field plug-in can detect how long a YouTube video has been playing for.

[![Download now](extras/readme-images/beta-release-download.jpeg)](https://github.com/surveycto/detect-clicked-link/raw/master/detect-clicked-link.fieldplugin.zip)

*This plug-in is currently under beta. If you you find a problem with the field plug-in, please email support@surveycto.com, or submit an issue to this GitHub repo.*

## Features

* Display a YouTube video.
* Track how long the YouTube video is played for.
* Track if video completed or not.
* Auto-fit video based on field area and screen size.
* Optionally, reset the time tracking if the enumerator returns to the field and plays the video again.

### Requirements

Android: Android 7 or up

iOS and web browsers: Because web browsers and iOS devices are kept more up-to-date with the latest features, nearly all web browsers and iOS devices should support the field plug-in, but test it on your collection device beforehand to be sure.

Because the video is coming from YouTube, this field plug-in requires an internet connection.

## Data format

The field value will be the selected choice.

The metadata will store two pieces of data in a space-separated list:

1. The time in milliseconds the video was playing for.
2. A `1` if the video played until the end, and `0` otherwise.

For example, if the video was played for 5,000 milliseconds (5 seconds), and did not play until the end, then the metadata will be:

    5000 0

You can use the plug-in-metadata() function to retrieve the metadata (it is a good idea to use it in a [*calculate_here* field](https://docs.surveycto.com/02-designing-forms/01-core-concepts/03zb.field-types-calculate.html) so it updates when needed), and the selected-at() function to retrieve each individual piece of data. Check out our documentation on [using expressions](https://docs.surveycto.com/02-designing-forms/01-core-concepts/09.expressions.html) to learn more.

This field plug-in tracks how much time the video was playing, not how much of the video was watched. Hypothetically (though unlikely), a respondent could watch the same five seconds of video four times, and the field plug-in would track that as watching the video for 20 seconds. This is why checking if the video completed or not can be helpful.


## How to use

### Getting started

*To use this plug-in as is:*

1. Download the [sample form](https://github.com/surveycto/detect-clicked-link/raw/master/extras/sample-form/Other%20choice%20sample%20form.xlsx) from this repo, as well as the [media files ZIP file](https://github.com/surveycto/detect-clicked-link/raw/master/extras/sample-form/media.zip). You can use the sample form as-is, or adjust the parameters to change the behavior ([see below](#parameters)).
1. Download the [detect-clicked-link.fieldplugin.zip](https://github.com/surveycto/detect-clicked-link/raw/master/detect-clicked-link.fieldplugin.zip) file from this repo, and attach it to the sample form on your SurveyCTO server.
1. Upload the sample form to your server, with the field plug-in attached.

### Parameters

|Name|Description|
|:--|:--|
|`video` (required)|The ID of the YouTube video. When you go to a YouTube video in a web browser, if you look at the URL, you'll notice it starts `https://www.youtube.com/watch?v=`, followed by a seemingly random series of numbers, letters, and hyphens. That series of characters is the ID of the YouTube video. For example, for [this video](https://www.youtube.com/watch?v=VmGM-jlAqIw), the URL is `https://www.youtube.com/watch?v=VmGM-jlAqIw`, so the YouTube video ID is "VmGM-jlAqIw", and you can use that for the `video` parameter value.|
|`autoplay` (optional)|If this parameter has a value of `1`, then the video will play as soon as it loads. Otherwise, the video will not play until the enumerator clicks on it.|
|`reset` (optional)|<p>If this parameter is not defined, then if the respondent watches the video for 5,000 milliseconds, moves away from the field, returns to the video, and continues watching the video for 10,000 milliseconds, then their time spent watching the video will be tracked as 15,000 milliseconds, If this parameter has a value of `1`, then the field plug-in will drop the previous 5,000 milliseconds, and only track the video as being watched for 10,000 milliseconds. Because a the video restarts when you leave the field and come back, this can be used to make sure respondents watch the entire video this time. It will also reset whether the video ended or not.</p><p>Because this will make the respondent lose their watch progress if they start the video over, if you do use this parameter, it is a good idea to have a warning to the respondent</p><p>If the respondent leaves the field, returns, but does not play the video again, then their time will not reset.</p>|

### Important: Adding the video

This field plug-in allows you to customize where the video will go in the field label. Take a look at this:

    <div id="player"></div>

Simply add that to the location in the field label where you would like the video displayed, and the video will load there. Check out the [sample form](https://github.com/surveycto/detect-clicked-link/raw/master/extras/sample-form/Other%20choice%20sample%20form.xlsx) for an example.

## Default SurveyCTO feature support

| Feature / Property | Support |
| --- | --- |
| Supported field type(s) | `select_one`, `select_multiple`|
| Default values | Yes |
| Custom constraint message | Yes |
| Custom required message | Yes |
| Read only | Yes |
| media:image | Yes |
| media:audio | Yes |
| media:video | Yes |
| `quick` appearance | Yes (`select_one` only) |
| `minimal` appearance | Yes (`select_one` only) |
| `compact` appearance | No |
| `compact-#` appearance | No |
| `quickcompact` appearance | No |
| `quickcompact-#` appearance | No |
| `likert` appearance | Yes (`select_one` only) |
| `likert-min` appearance | Yes* (`select_one` only) |
| `likert-mid` appearance | No |
| `label` appearance | Yes |
| `list-nolabel` appearance | Yes |

*Note: this plug-in works well for the likert-min appearance when the field label is short, and does not contain an image, audio, or video. This is currently a known limitation.

## More resources

This field plug-in uses the [YouTube IFrame player API](https://developers.google.com/youtube/iframe_api_reference) from Google.

* **Developer documentation**  
Instructions and resources for developing your own field plug-ins.  
[https://github.com/surveycto/Field-plug-in-resources](https://github.com/surveycto/Field-plug-in-resources)

* **User documentation**  
How to get started using field plug-ins in your SurveyCTO form.  
[https://docs.surveycto.com/02-designing-forms/03-advanced-topics/06.using-field-plug-ins.html](https://docs.surveycto.com/02-designing-forms/03-advanced-topics/06.using-field-plug-ins.html)