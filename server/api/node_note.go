package api

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/oseducation/knowledge-graph/model"
)

func (apiObj *API) initNodeNote() {
	apiObj.NodeNotes = apiObj.APIRoot.Group("/notes")

	apiObj.NodeNotes.POST("/", authMiddleware(), createNote)
	apiObj.NodeNotes.PUT("/", authMiddleware(), updateNote)
	apiObj.NodeNotes.DELETE("/:noteID", authMiddleware(), deleteNote)
	apiObj.NodeNotes.GET("/users/:userID", authMiddleware(), getNoteNamesForUser)
	apiObj.NodeNotes.GET("/:noteID", authMiddleware(), getNote)
}

func createNote(c *gin.Context) {
	note, err := model.UserNodeNoteJSON(c.Request.Body)
	if err != nil {
		responseFormat(c, http.StatusBadRequest, "Invalid or missing `note` in the request body")
		return
	}

	a, err := getApp(c)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}

	rnote, err := a.CreateNote(note)
	if err != nil {
		if strings.Contains(err.Error(), "invalid user note error") {
			responseFormat(c, http.StatusBadRequest, "Invalid or missing `note` in the request body")
		}
		responseFormat(c, http.StatusInternalServerError, "Error while creating node")
		return
	}
	responseFormat(c, http.StatusCreated, rnote)
}

func updateNote(c *gin.Context) {
	updatedNote, err := model.UserNodeNoteJSON(c.Request.Body)
	if err != nil {
		responseFormat(c, http.StatusBadRequest, "Invalid or missing `note` in the request body")
		return
	}
	a, err := getApp(c)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}

	err = a.UpdateNote(updatedNote)
	if err != nil {
		if strings.Contains(err.Error(), "invalid user note error") {
			responseFormat(c, http.StatusBadRequest, "Invalid or missing `note` in the request body")
		}
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}
	responseFormat(c, http.StatusOK, "Note updated")
}

func deleteNote(c *gin.Context) {
	noteID := c.Param("noteID")
	if noteID == "" {
		responseFormat(c, http.StatusBadRequest, "missing note_id")
		return
	}
	a, err := getApp(c)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}

	note, err := a.Store.NodeNote().Get(noteID)
	if err != nil {
		responseFormat(c, http.StatusBadRequest, "unknown node")
		return
	}

	if err = a.DeleteNote(note); err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}

	responseFormat(c, http.StatusOK, "Node deleted")
}

func getNoteNamesForUser(c *gin.Context) {
	userID := c.Param("userID")
	if userID == "" {
		responseFormat(c, http.StatusBadRequest, "missing user_id")
		return
	}

	a, err := getApp(c)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}

	session, err := getSession(c)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}

	if session.UserID != userID {
		responseFormat(c, http.StatusBadRequest, "invalid user_id")
		return
	}

	notes, err := a.GetNotesForUser(userID)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}
	responseFormat(c, http.StatusCreated, notes)
}

func getNote(c *gin.Context) {
	noteID := c.Param("noteID")
	if noteID == "" {
		responseFormat(c, http.StatusBadRequest, "missing note_id")
		return
	}

	a, err := getApp(c)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}

	note, err := a.GetUserNodeNote(noteID)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}
	responseFormat(c, http.StatusCreated, note)
}
