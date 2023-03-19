package log

import (
	"net"
	"net/http"
	"net/http/httputil"
	"os"
	"runtime/debug"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

// GinLogger returns a gin.HandlerFunc (middleware) that logs requests using our logger.
//
// Requests with errors are logged using log.Error().
// Requests without errors are logged using log.Info().
func GinLogger(logger *Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		path := c.Request.URL.Path
		query := c.Request.URL.RawQuery
		c.Next()
		end := time.Now()
		latency := end.Sub(start)

		if len(c.Errors) > 0 {
			// Append error field if this is an erroneous request.
			for _, e := range c.Errors.Errors() {
				logger.Error(e)
			}
		} else {
			logger.Info(path,
				Int("status", c.Writer.Status()),
				String("method", c.Request.Method),
				String("path", path),
				String("query", query),
				String("ip", c.ClientIP()),
				String("user-agent", c.Request.UserAgent()),
				String("time", end.Format(time.RFC3339)),
				Duration("latency", latency),
			)
		}
	}
}

// RecoveryWithLogger returns a gin.HandlerFunc (middleware)
// that recovers from any panics and logs requests using our logger.
// All errors are logged using log.Error().
func RecoveryWithLogger(logger *Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				// Check for a broken connection, as it is not really a
				// condition that warrants a panic stack trace.
				var brokenPipe bool
				if ne, ok := err.(*net.OpError); ok {
					if se, ok := ne.Err.(*os.SyscallError); ok {
						if strings.Contains(strings.ToLower(se.Error()), "broken pipe") || strings.Contains(strings.ToLower(se.Error()), "connection reset by peer") {
							brokenPipe = true
						}
					}
				}

				httpRequest, _ := httputil.DumpRequest(c.Request, false)
				if brokenPipe {
					logger.Error(c.Request.URL.Path,
						Any("error", err),
						String("request", string(httpRequest)),
					)
					// If the connection is dead, we can't write a status to it.
					c.Error(err.(error))
					c.Abort()
					return
				}
				logger.Error("[Recovery from panic]",
					Time("time", time.Now()),
					Any("error", err),
					String("request", string(httpRequest)),
					String("stack", string(debug.Stack())),
				)

				c.AbortWithStatus(http.StatusInternalServerError)
			}
		}()
		c.Next()
	}
}
