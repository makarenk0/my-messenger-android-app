import * as React from "react";
import { Text, View } from "react-native";

export default class Success extends React.Component {
  render() {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "space-between"
        }}
      >
        <View />
        <Text style={{ fontSize: 20, textAlign: "center" }}>
          Congratulations. The thing you wanted to happen has happened.
        </Text>
        <View />
      </View>
    );
  }
}