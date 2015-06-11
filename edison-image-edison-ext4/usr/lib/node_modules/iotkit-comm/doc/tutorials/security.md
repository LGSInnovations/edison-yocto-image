iotkit-comm makes it simple for clients and services running on your Edisons to securely communicate with each other.
 To enable secure communications, follow the two steps below:
 1. Setup credentials
 2. Configure client programs to communicate securely

#### Setup credentials

*This section assumes that your Edisons have been configured with a 'root' password using either the web-based
setup tool or the command `configure_edison --setup`*

To setup credentials, run the following command on one of your Edisons:
```sh
iotkit-comm setupAuthentication hosts.txt
```

Here, `hosts.txt` is a file containing a list of Edisons you want to setup. Here's an example:
```sh
# lines beginning with a hash are ignored
root,edison1.local
root,edison2.local
```

Of course, you would replace the `.local` addresses with the address of your Edisons. Also, please be sure to use
addresses in the format `hostname.local` as opposed to raw IP addresses or 'localhost'. For more detailed help, just
type `iotkit-comm` on the command-line.

#### Configure client programs to communicate securely

 *This section assumes that you know how to write a client application using iotkit-comm. If not,
 please go through the [client]{@tutorial client} tutorial first.*

Add the following line to the [Service Query]{@tutorial service-spec-query} or
[Service Specification]{@tutorial service-spec-query} for the client program:

```json
"type_params": {"mustsecure": true}
```

That's it! This client will now communicate securely with any server it connects to. This is true regardless of the
plugin used to communicate (e.g. `mqtt`, `zmqpubsub`, `zmqreqrep`, etc.). Note that the service does not
need any changes as long as the device its running on was configured using the `iotkit-comm setupAuthentication` script
mentioned above.
