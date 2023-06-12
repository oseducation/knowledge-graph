package app

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"regexp"
	"strconv"
	"strings"

	"github.com/pkg/errors"
)

func (a *App) GetYoutubeVideoInfo(videoID string) (string, int64, error) {
	apiKey, ok := a.Environment[YoutubeAPIKey]
	if !ok {
		return "", 0, errors.New("no youtube api key")
	}

	type youtubeResponse struct {
		Items []struct {
			Snippet struct {
				Title string `json:"title"`
			} `json:"snippet"`
			ContentDetails struct {
				Duration string `json:"duration"`
			} `json:"contentDetails"`
		} `json:"items"`
	}
	req, _ := http.NewRequest("GET", fmt.Sprintf("https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=%s&key=%s", videoID, apiKey), nil)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", 0, errors.Wrap(err, "can't send request to youtube")
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	var apiResponse youtubeResponse
	if err2 := json.Unmarshal(body, &apiResponse); err2 != nil {
		return "", 0, errors.Wrap(err2, "unable to marshal")
	}

	if len(apiResponse.Items) != 1 {
		return "", 0, errors.Wrap(err, "not a single video for this key")
	}
	duration, err := parseDuration(apiResponse.Items[0].ContentDetails.Duration)
	if err != nil {
		return "", 0, errors.Wrapf(err, "can't parse duration %s", apiResponse.Items[0].ContentDetails.Duration)
	}
	return apiResponse.Items[0].Snippet.Title, duration, nil
}

func parseDuration(duration string) (int64, error) {
	re, err := regexp.Compile(`PT(\d+H)?(\d+M)?(\d+S)?`)
	if err != nil {
		return 0, errors.Wrap(err, "duration not in ISO 8601 standard")
	}
	matches := re.FindStringSubmatch(duration)

	hours := parseTime(matches[1], "H")
	minutes := parseTime(matches[2], "M")
	seconds := parseTime(matches[3], "S")

	return hours*3600 + minutes*60 + seconds, nil
}

func parseTime(s, suffix string) int64 {
	if s != "" {
		s = strings.TrimSuffix(s, suffix)
		i, _ := strconv.Atoi(s)
		return int64(i)
	}
	return 0
}
