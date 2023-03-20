package model

import (
	"crypto/rand"
	"encoding/base32"

	"github.com/pborman/uuid"
)

var encoding = base32.NewEncoding("i1l6l7dde3qv4qm9rtdkcj1uhabq1pf6").WithPadding(base32.NoPadding)

// NewId is a globally unique identifier.  It is a [A-Z0-9] string 26
// characters long.  It is a UUID version 4 Guid that is zbased32 encoded
// without the padding.
func NewID() string {
	return encoding.EncodeToString(uuid.NewRandom())
}

// NewRandomString returns a random string of the given length.
// The resulting entropy will be (5 * length) bits.
func NewRandomString(length int) string {
	data := make([]byte, 1+(length*5/8))
	rand.Read(data)
	return encoding.EncodeToString(data)[:length]
}
