#!/bin/bash

function one_line_pem {
    echo "`awk 'NF {sub(/\\n/, ""); printf "%s\\\\\\\n",$0;}' $1`"
}

function yaml_ccp {
    local OP=$(one_line_pem $5)
    local PP1=$(one_line_pem $6)
    local PP2=$(one_line_pem $7)
    local CP=$(one_line_pem $8)
    sed -e "s/\${ORG}/$1/" \
        -e "s/\${PORT_ORDERER}/$2/" \
        -e "s/\${PORT_PEER}/$3/" \
        -e "s/\${PORT_CA}/$4/" \
        -e "s#\${PEM_ORDERER}#$OP#" \
        -e "s#\${PEM_ORG1}#$PP1#" \
        -e "s#\${PEM_ORG2}#$PP2#" \
        -e "s#\${PEM_CA}#$CP#" \
        -e "s/\${IP_ORDERER1}/$9/" \
        -e "s/\${IP_ORDERER2}/${10}/" \
        -e "s/\${IP_ORDERER3}/${11}/" \
        -e "s/\${IP_ORDERER4}/${12}/" \
        -e "s/\${IP_ORDERER5}/${13}/" \
        -e "s/\${IP_P0O1}/${14}/" \
        -e "s/\${IP_P1O1}/${15}/" \
        -e "s/\${IP_P0O2}/${16}/" \
        -e "s/\${IP_P1O2}/${17}/" \
        -e "s/\${IP_CA}/${18}/" \
        organizations/ccp-template.yaml | sed -e $'s/\\\\n/\\\n        /g'
}

IP_ORDERER1=120.125.82.23
IP_ORDERER2=120.125.82.27
IP_ORDERER3=120.125.82.28
IP_ORDERER4=120.125.82.29
IP_ORDERER5=120.125.82.30
IP_P0O1=120.125.82.23
IP_P1O1=120.125.82.27
IP_P0O2=120.125.82.28
IP_P1O2=120.125.82.29
IP_CA_ORG1=120.125.82.23
IP_CA_ORG2=120.125.82.28

PORT_ORDERER=7050
PORT_PEER=7051
PORT_CA=7054

PEM_ORDERER=organizations/ordererOrganizations/example.com/tlsca/tlsca.example.com-cert.pem
PEM_ORG1=organizations/peerOrganizations/org1.example.com/tlsca/tlsca.org1.example.com-cert.pem
PEM_ORG2=organizations/peerOrganizations/org2.example.com/tlsca/tlsca.org2.example.com-cert.pem

ORG=1
IP_CA_ORG1=localhost
PORT_CA=7054
PEM_CA=organizations/peerOrganizations/org1.example.com/ca/ca.org1.example.com-cert.pem
echo "$(yaml_ccp $ORG $PORT_ORDERER $PORT_PEER $PORT_CA $PEM_ORDERER $PEM_ORG1 $PEM_ORG2 $PEM_CA $IP_ORDERER1 $IP_ORDERER2 $IP_ORDERER3 $IP_ORDERER4 $IP_ORDERER5 $IP_P0O1 $IP_P1O1 $IP_P0O2 $IP_P1O2 $IP_CA_ORG1)" > organizations/peerOrganizations/org1.example.com/connection-org1.yaml

ORG=2
IP_CA_ORG1=localhost
PORT_CA=8054
PEM_CA=organizations/peerOrganizations/org2.example.com/ca/ca.org2.example.com-cert.pem
echo "$(yaml_ccp $ORG $PORT_ORDERER $PORT_PEER $PORT_CA $PEM_ORDERER $PEM_ORG1 $PEM_ORG2 $PEM_CA $IP_ORDERER1 $IP_ORDERER2 $IP_ORDERER3 $IP_ORDERER4 $IP_ORDERER5 $IP_P0O1 $IP_P1O1 $IP_P0O2 $IP_P1O2 $IP_CA_ORG2)" > organizations/peerOrganizations/org2.example.com/connection-org2.yaml
