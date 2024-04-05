package app

import (
	"math/rand"
	"strconv"
	"strings"
	"time"

	"github.com/oseducation/knowledge-graph/config"
	"github.com/oseducation/knowledge-graph/log"
	"github.com/oseducation/knowledge-graph/model"
	"github.com/oseducation/knowledge-graph/services"
	"github.com/oseducation/knowledge-graph/store"
	"github.com/pkg/errors"
)

// App type defines application global state
type App struct {
	Log      *log.Logger
	Store    store.Store
	Config   *config.Config
	Graph    *model.Graph
	Services *services.Services
	Random   *rand.Rand
}

// NewApp creates new App
func NewApp(logger *log.Logger, store store.Store, config *config.Config) (*App, error) {
	graph, err := store.Graph().ConstructGraphFromDB()
	if err != nil {
		return nil, errors.Wrap(err, "can't construct graph from DB")
	}
	logger.Info("graph constructed", log.String("nodes", strconv.Itoa(len(graph.Nodes))), log.String("prerequisites", strconv.Itoa(len(graph.Prerequisites))))

	services, err := services.NewServices(store, logger)
	if err != nil {
		return nil, errors.Wrap(err, "can't create services")
	}

	r := rand.New(rand.NewSource(time.Now().UnixNano()))

	return &App{logger, store, config, graph, services, r}, nil
}

// GetSiteURL returns site url from config
func (a *App) GetSiteURL() string {
	url := a.Config.ServerSettings.SiteURL
	if strings.Contains(url, "localhost") {
		url = "https://www.vitsi.ai"
	}
	return url
}

// PerformDBCheck checks if database is connectable
func (a *App) PerformDBCheck() error {
	if _, err := a.Store.System().GetCurrentVersion(); err != nil {
		return err
	}
	return nil
}
