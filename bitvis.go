// Copyright 2018 Google Inc. All rights reserved.
// Use of this source code is governed by the Apache 2.0
// license that can be found in the LICENSE file.

package main

import (
	"net/http"

	"google.golang.org/appengine"
	"html/template"
)

var indexTemplate = template.Must(template.ParseFiles("index.html"))

func main() {
	http.HandleFunc("/", handle)
	appengine.Main()
}

type Context struct {
}

func handle(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		http.NotFoundHandler()
	} else {
		handleIndex(w, r)
	}
}

func handleIndex(w http.ResponseWriter, r *http.Request) {
	indexTemplate.Execute(w, Context{})
}
