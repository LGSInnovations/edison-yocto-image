#!/bin/sh
# Absolute path to this script, e.g. /home/user/bin/foo.sh
SCRIPT=$(readlink -f "$0")
# Absolute path this script is in, thus /home/user/bin
DIR=$(dirname "$SCRIPT")
PRODUCT_NAME="Intel XDK Daemon"
SERVICE_NAME="xdk-daemon"
INSTALL_LOCATION="/opt"
INSTALL_FOLDER="/xdk-daemon"
APPSLOT="/node_app_slot"


# ----------------------------------------------------------------------------
# This code attempts to detect the MDNS technology the XDK should rely on
MDNS_STATUS=$(systemctl is-active mdns.service)
AVAHI_STATUS=$(systemctl is-active avahi-daemon.service)

if [ "$MDNS_STATUS" = "active" ]
then
  SERVICE_FILE_EXTENSTION="mdns"
  echo "MDNS Detected!"
elif [ "$AVAHI_STATUS" = "active" ]
then
  SERVICE_FILE_EXTENSTION="avahi"
  echo "AVAHI Detected!"
else
  SERVICE_FILE_EXTENSTION="generic"
  echo "No MDNS solution detected!"
fi
# ----------------------------------------------------------------------------

# if not root, try to use sudo
if [[ `whoami` == "root" ]];
then
  SUDO=""
else
  SUDO="sudo"
fi

# installing packages globally
#$SUDO npm install -g
echo "==================================================================="
echo " Installing ${PRODUCT_NAME}"
echo "==================================================================="
echo ""
echo ""
echo " Installing modules for daemon version manager"
echo "--------------------------------------------------------------------"
$SUDO cd $DIR
$SUDO export CPLUS_INCLUDE_PATH=/usr/include/avahi-compat-libdns_sd
$SUDO npm install
echo " DONE!"

echo ""
echo " Installing modules for application daemon component"
echo "--------------------------------------------------------------------"
$SUDO cd $DIR/current
$SUDO npm install
echo " DONE!"

echo ""
echo " Installing modules for debugger agent component"
echo "--------------------------------------------------------------------"
$SUDO cd $DIR/current/node-inspector-server
$SUDO npm install
echo " DONE!"

$SUDO cd $DIR


if [[ "$1" != "build" ]]
then
#=============================================================================
# INSTALLATION STEPS
#=============================================================================

#make all needed directories
echo "Copying main daemon to $INSTALL_LOCATION$INSTALL_FOLDER"
$SUDO mkdir -p $INSTALL_LOCATION$INSTALL_FOLDER
$SUDO cp -ar $DIR/* $INSTALL_LOCATION$INSTALL_FOLDER/
$SUDO chmod 755 $INSTALL_LOCATION$INSTALL_FOLDER/xdk-daemon
echo "DONE!"
echo ""

#Fill previous slot
echo "Archiving current daemon as previous/recovery daemon"
$SUDO mkdir -p $INSTALL_LOCATION$INSTALL_FOLDER/previous
$SUDO cp -ar $DIR/current/* $INSTALL_LOCATION$INSTALL_FOLDER/previous/
echo "DONE!"
echo ""

#Fill default slot
echo "Archiving current daemon as default"
$SUDO mkdir -p $INSTALL_LOCATION$INSTALL_FOLDER/default
$SUDO cp -ar $DIR/current/* $INSTALL_LOCATION$INSTALL_FOLDER/default/
echo "DONE!"
echo ""


#APPLICATION SLOT CREATION NOW HANDLED AT START OF DAEMON
#create app slot
#echo "Creating Application Slot"
#$SUDO mkdir -p /home/root/.node_app_slot
#$SUDO ln -s /home/root/.node_app_slot $APPSLOT
#$SUDO mkdir -p $APPSLOT
#echo "DONE!"
#echo ""

# create a symbolic link for the whitelisst utiltiy
echo ""
echo " Setting up whitelist utility"
echo "--------------------------------------------------------------------"
${SUDO} ln -s $INSTALL_LOCATION$INSTALL_FOLDER/current/xdk-whitelist /usr/bin/xdk-whitelist
${SUDO} chmod 755 $INSTALL_LOCATION$INSTALL_FOLDER/current/xdk-whitelist

# try add a startup script to our init system
echo ""
echo " Copying start-up script"
echo "--------------------------------------------------------------------"
if [[ -d /etc/systemd/system ]]
then
  ${SUDO} cp -f ./${SERVICE_NAME}-${SERVICE_FILE_EXTENSTION}.service /etc/systemd/system/${SERVICE_NAME}.service
  ${SUDO} chmod 755 /etc/systemd/system/${SERVICE_NAME}.service
  ${SUDO} systemctl enable ${SERVICE_NAME} --force
#elif [[ -d /etc/rc5.d/ ]]
#then
# $SUDO cp -f ./S85xdk-daemon.sh /etc/rc5.d/
#else
# echo "no /etc/rc5.d directory - startup script not copied"
fi


read -p "Start $PRODUCT_NAME now? (y/n)? " -n 1 -r
echo    # (optional) move to a new line
#if [[ ! $REPLY =~ ^[Yy]$ ]]
echo #blank line
if  [ "$REPLY" = "y" ]
then
    echo "Starting $SERVICE_NAME now!"
    $SUDO systemctl daemon-reload
    $SUDO systemctl restart $SERVICE_NAME 
else
    echo "$SERVICE_NAME not started"
    echo "Type: 'systemctl start $SERVICE_NAME' to start the $SERVICE_NAME"
fi
#=============================================================================
echo #blank line
echo "Setup complete!"
fi
echo ""

