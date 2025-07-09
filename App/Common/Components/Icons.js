import React from "react"
import { Image, View, StyleSheet } from "react-native"

// Note: Cannot use TypeScript for this component, because it need React.Node
//
// custom icon renderer passed to iconRenderer prop 
// see the switch for possible icon name 
// values 
// custom icon renderer passed to iconRenderer prop 
 // see the switch for possible icon name 
 // values 
 Icons = ({ name, size = 18, style }) => {
   // flatten the styles 
   const flat = StyleSheet.flatten(style) 
   // remove out the keys that aren't accepted on View 
   const { color, fontSize, ...styles } = flat 
  
   let iconComponent 
   // the colour in the url on this site has to be a hex w/o hash 
   const iconColor = color && color.substr(0, 1) === '#' ? `${color.substr(1)}/` : ''
  
   const Search = ( 
     <Image 
       source={require("../Assets/search_24dp.png")}
       color="red"
       style={{ width: size, height: size }} 
     /> 
   ) 
   const Down = ( 
     <Image 
       source={require("../Assets/arrow_down_22dp.png")}
       style={{ width: size, height: size }} 
     /> 
   ) 
   const Up = ( 
     <Image 
       source={require("../Assets/arrow_up_22dp.png")} 
       style={{ width: size, height: size }} 
     /> 
   ) 
   const Close = ( 
     <Image 
       source={require("../Assets/close_16dp.png")}
       style={{ width: size, height: size }} 
     /> 
   ) 
   const Check = ( 
     <Image 
       source={require("../Assets/check_16dp.png")} 
       style={{ width: size, height: size }} 
     /> 
   ) 
   const Cancel = ( 
     <Image 
       source={require("../Assets/cancel_18dp.png")} 
       style={{ width: size, height: size }} 
     /> 
   ) 
  
   switch (name) { 
     case 'search': 
       iconComponent = Search 
       break 
     case 'keyboard-arrow-up': 
       iconComponent = Up 
       break 
     case 'keyboard-arrow-down': 
       iconComponent = Down 
       break 
     case 'close': 
       iconComponent = Close 
       break 
     case 'check':
       iconComponent = Check 
       break 
     case 'cancel': 
       iconComponent = Cancel 
       break 
     default:
       iconComponent = null 
       break 
   } 
   return <View style={styles}>{iconComponent}</View> 
 }

export default Icons