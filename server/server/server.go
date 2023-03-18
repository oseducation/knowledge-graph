package server

import (
	"context"
	"net/http"
	"os"
	"time"

	"github.com/gorilla/mux"
	"github.com/oseducation/knowledge-graph/log"
)

const listenerPort = ":9081"

// Server type defines application global state
type Server struct {
	Router *mux.Router
	Log    *log.Logger
	srv    *http.Server
}

// NewServer creates new Server
func NewServer(logger *log.Logger) (*Server, error) {
	router := mux.NewRouter()

	a := &Server{
		Router: router,
		Log:    logger,
	}

	pwd, _ := os.Getwd()
	a.Log.Info("Printing current working", log.String("directory", pwd))
	return a, nil
}

// Start method starts an app
func (a *Server) Start() error {
	a.Log.Info("Server is listening on", log.String("port", listenerPort))
	a.srv = &http.Server{
		Addr:    listenerPort,
		Handler: a.Router,
	}

	// Initializing the server in a goroutine so that
	// it won't block the graceful shutdown handling below
	go func() {
		if err := a.srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			a.Log.Error("listen: ", log.Err(err))
		}
	}()

	return nil
}

// Shutdown method shuts server down
func (a *Server) Shutdown() {
	a.Log.Info("Stoping Server...")
	// The context is used to inform the server it has 5 seconds to finish
	// the request it is currently handling
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := a.srv.Shutdown(ctx); err != nil {
		a.Log.Error("Server forced to shutdown", log.Err(err))
	}
	a.Log.Info("Server stopped")
}
