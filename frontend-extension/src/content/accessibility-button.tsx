// //might need to deleate it later

// const AccessibilityButton = () => {

//   const onclick = async () => {
//     const [tab] = await chrome.tabs.query({ active: true})
//     chrome.scripting.executeScript({
//       target: {tabId: tab.id! },
//       func: () => {
//         document.body.style.backgroundColor = "lightblue";
//         console.log("Accessibility improvements applied!");
//       }
//     });
//     // const images = document.querySelectorAll("img")
//   }

//   return (
//     <button
//       style={{top: "10px", right: "10px", zIndex: 1000, background: "blue", color: "white", padding: "10px",borderRadius: "5px"}}
//       onClick={() => {onclick(); }}>
//       Accessibility
//     </button>
//   )
// }
// export default AccessibilityButton
