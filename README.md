Edison Yocto Image
==================

The ext4 partition to flash the Intel Edison, based on the [Yocto Project](https://www.yoctoproject.org/).

For more info on contributing or using this image, see the [Edison Ethernet project](https://github.com/LGSInnovations/Edison-Ethernet).

**Warning**: Only clone this repo on a Linux based machine -- Windows and Mac OS X will complain about invalid file naming.

### Files Added/Changed ###

Below is a directory tree of files added(\*\*) or changed(\*) with a short description.

```bash
	/
	+-- bin/
	+-- boot/
	+-- dev/
	+-- etc/
	|	+-- alternatives/
	|	+-- ...
	|	+-- network/**
	|	|	+-- if-pre-up.d/**
	|	|	|	+-- change-mac** :: When the lo interace is loading on boot, change the MAC of eth0 based on /factory/mac
	|	|	+-- interfaces** :: Added 'auto eth0' and 'iface eth0 inet dhcp' to support the Ethernet block
	|	+-- ...
	|	+-- fstab* :: Added the /factory (/dev/mmcblk0p5) partition to be mounted on boot
	+-- ...
	+-- home/
	|	+-- root/
	|	|	+-- .bashrc** :: Added
	|	|	+-- .profile** :: Added useful aliases
	+-- sbin/
	|	+-- agetty
	|	+-- ...
	|	+-- post-install.sh* :: Added MAC address file, permission fixes, dependency installations.

```