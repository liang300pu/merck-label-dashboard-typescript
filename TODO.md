# Server
- [x] Implement printing using node-brother-lable-printer library
- [x] Generate qr code keys using a seeded or consistent hash algorithm
- [x] Generate qr codes and be able to send them to front-end

# Client
- [x] Button to edit a sample in table format
    - [ ] Have a log somewhere that shows who edited what and when
- [ ] Clean up styles, remove unused styles and make website look better
- [x] Create different pages for (below) using react-router & react-router-dom. On top of this need to set up a router to redirect qr codes when scanned:
    - [x] Sample viewing
    - [x] Sample creating
    - [ ] Edit log
    - [ ] QR Code scanning
- [x] Fix default value for textfields that are supposed to have dates
- [ ] MUI styles works sometimes and sometimes they dont -> could be because no theme is declared?
- [x] Plan for edit button functionality
    - When edit button is clicked, switch out the text in the table cell with a text field and change the edit icon to a checkmark and add an x next to it
- [ ] Use luxon to format dates properlly
- [ ] Make it so you cant create a sample that has the same properties as an existing one
    - if new_qr_code_key == existing_qr_code_key dont create that new sample
- [ ] Add the ability to scan a qr code using scanner
- [ ] Possibly add the ability for scientist to have an account, basically just name so that you could sort by analyst. Or find all samples by a scientist. May not need cause you could just search anyway
- [ ] When creating a sample, cache the the form contents so that if the page is changed and then we come back, the form hasnt gone away
- [ ] Mark samples in red if they are expired.
- [ ] Set a note window to type in reasons why samples are edited and/or discarded.
- [ ] Make a functionality to sort samples based on their created date.
- [ ] Add a filter button.
- [ ] User can click view history tab to see all the previous versions.
- [ ] Add a button to view all the discarded samples.
- [ ] Add button to show how many samples have been printed, how many samples in total, etc.

# Label Management
- Labels are generated once upon request and cached
- Labels will be re-generated when edited
- If we get the same label twice just generate once then return cached base64 string or img obj
- ### Big Question
    - If labels are updated should their qr code key be changed? 
    - The qr code key is based off the properties of the sample so if the properties change the qr code key would as well
    - (Currently it doesnt change upon updates)

