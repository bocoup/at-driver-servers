# macOS AT Driver Server

An implementation of the [AT Driver](https://w3c.github.io/at-driver/) remote
end designed to work with screen readers on macOS.

**[aria-at-automation](https://github.com/w3c/aria-at-automation)** &middot; [aria-at-automation-harness](https://github.com/w3c/aria-at-automation-harness) &middot; aria-at-automation-driver &middot; [aria-at-automation-results-viewer](https://github.com/w3c/aria-at-automation-results-viewer)

## Requirements

- macOS version 13 ("Ventura") or later
- Node.js version 18 or later

## Usage

1.  Run the `install` sub-command in a terminal:

        at-driver install

    If prompted for system administration permission, grant permission.

2.  Start the server by executing the `serve` sub-command in a terminal:

        at-driver serve

    The process will write a message to the standard error stream when the
    WebSocket server is listening for connections. The `--help` flag will cause
    the command to output advanced usage instructions (e.g. `at-driver --help`).

3.  Configure any screen reader to use the text-to-speech voice named "Bocoup
    Automation Voice."

4.  Use any WebSocket client to connect to the server. The protocol is described
    below. (The server will print protocol messages to its standard error stream
    for diagnostic purposes only. Neither the format nor the availability of
    this output is guaranteed, making it inappropriate for external use.)

### WebSocket server

The WebSocket server is written in Node.js and allows an arbitrary number of
clients to observe events on a standard interface. It has been designed as an
approximation of an interface that may be exposed directly by screen readers in
the future.

## Contribution Guidelines

For details on contributing to this project, please refer to the file named
`CONTRIBUTING.md`.

## License

Licensed under the terms of the MIT Expat License; the complete text is
available in the LICENSE file.

---

### [aria-at-automation](https://github.com/w3c/aria-at-automation)

A collection of projects for automating assistive technology tests from [w3c/aria-at](https://github.com/w3c/aria-at) and beyond

**[aria-at-automation-harness](https://github.com/w3c/aria-at-automation-harness)**  
A command-line utility for executing test plans from [w3c/aria-at](https://github.com/w3c/aria-at) without human intervention using [the aria-at-automation-driver](https://github.com/w3c/aria-at-automation-driver)

**aria-at-automation-driver**  
A WebSocket server which allows clients to observe the text enunciated by a screen reader and to simulate user input

**[aria-at-automation-results-viewer](https://github.com/w3c/aria-at-automation-results-viewer)**  
A tool which translates the JSON-formatted data produced by the [aria-at-automation-harness](https://github.com/w3c/aria-at-automation-harness) into a human-readable form
