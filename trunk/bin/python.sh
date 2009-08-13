#!/bin/sh
# The location of python install
python_home=C:/Python_2.5.1
python_cmd=$python_home/python.exe

for arg in $*
do
	python_cmd+=" $arg"
done

##############################################################################
# add -s to the end of the line to show items marked private
echo $python_cmd
$python_cmd