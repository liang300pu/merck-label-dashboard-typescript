import React, { useEffect, useRef, useState } from "react";

import { useSelector } from "react-redux";
import { State, useActionCreators } from "../../redux";

import { v4 as uuidv4 } from 'uuid';

import { Button, Checkbox, Paper, Typography } from "@mui/material";
import { FormatBold, FormatBoldOutlined, FormatItalic, FormatItalicOutlined } from "@mui/icons-material";

import LabelText from "./LabelText";
import ListDisplay from "../ListDisplay";

import qr_image from "../../images/basic_qr_code.png";

import { 
    CreateTeamLabelRequirements, 
    TeamLabel, 
    TeamLabelEntity, 
    TeamLabelEntityPosition 
} from "../../api";

import "./styles.css"


/**
 * TODO:
 *   - Once a qr code is viewed on one label it wont be able to be viewed on another label
 */

export interface LabelEntityInfoStore {
    [key: string]: TeamLabelEntity
}

interface LabelEditorProps {
    /**
     * The size of the label in millimeters
     */
    labelSize?: { width: number, length: number },
    editorSize?: { width: string | number, height: string | number },
    onEntityInfoChange?: (textInfo: LabelEntityInfoStore) => void,
    onSave?: (label: CreateTeamLabelRequirements) => void,
    footerComponents?: React.ReactNode,
    toolbarComponents?: React.ReactNode,
}

const LabelEditor: React.FC<React.PropsWithChildren<LabelEditorProps>> = ({
    labelSize: initialLabelSize = { width: 62, length: 90 },
    toolbarComponents,
    footerComponents,
    editorSize = { width: 'auto', height: 'auto' },
    onEntityInfoChange = () => {},
    onSave: overrideOnSave,
}) => {
    const editorRef = useRef<HTMLDivElement | null>(null);
    const lastMousePositionRef = useRef<{ x: number, y: number }>({ x: 0, y: 0 });

    const [labelSize, setLabelSize] = useState<{ width: number, length: number }>(initialLabelSize);

    const [entityIDs, setEntityIDs] = useState<string[]>([]);

    // For performance reasons, this could be split up into a couple different states if need be
    const [entities, setEntities] = useState<LabelEntityInfoStore>({});
    const [qrCodeID, setQRCodeID] = useState<string | null>(null);

    const { team, labels } = useSelector((state: State) => state);

    const [selectedEntityID, setSelectedEntityID] = useState<string | null>(null);

    const [isSelectedEntityHeld, setIsSelectedEntityHeld] = useState<boolean>(false);

    // Radius used when searching for nearby text in px
    const [alignmentSearchRadius, setAlignmentSearchRadius] = useState<number>(10);

    // Text used when adding new text
    const [newText, setNewText] = useState<string>("New Text");

    // (Font) Size used when adding new text
    const [newTextSize, setNewTextSize] = useState<number>(16);

    const [newBoldStatus, setNewBoldStatus] = useState<boolean>(false);

    const [newItalicStatus, setNewItalicStatus] = useState<boolean>(false);
    
    const { createLabel, /* deleteLabel */ fetchTeamsLabels } = useActionCreators();

    const onSave = async (label: CreateTeamLabelRequirements) => {
        if (overrideOnSave) {
            return overrideOnSave(label);
        }
        createLabel(label);
    }

    useEffect(() => {
        if (editorRef.current) {
            lastMousePositionRef.current = { x: editorRef.current.offsetLeft, y: editorRef.current.offsetTop };
        }
    }, []);

    useEffect(() => {
        if (team) {
            fetchTeamsLabels(team);
            clearLabel();
        }
    }, [team]);
    
    useEffect(() => {
        onEntityInfoChange(entities);
    }, [entities]);

    const updateLastMousePosition = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        lastMousePositionRef.current = { x: event.clientX, y: event.clientY };
    }

    const findNearbyText = (currentTextPosition: TeamLabelEntityPosition, axis: 'x' | 'y', exclude?: string[]) => {
        for (const textID of entityIDs) {
            if (exclude && exclude.includes(textID)) 
                continue;
            const text = entities[textID];

            const diff = Math.abs(text.position[axis] - currentTextPosition[axis]);

            if (diff <= alignmentSearchRadius) {
                return text.position[axis];
            }
        }
        return null;
    }

    const clearLabel = () => {
        setEntityIDs([]);
        setEntities({});
        setSelectedEntityID(null);
        setQRCodeID(null);
    }

    const loadLabel = (label: TeamLabel) => {
        const { data, width, length } = label;

        clearLabel();

        const ids: string[] = [];
        const entities: LabelEntityInfoStore = {};

        for (const entity of data) {
            const id = uuidv4();
            ids.push(id);
            if (entity.text === "") {
                setQRCodeID(id);
            }
            entities[id] = entity;
        }

        setSelectedEntityID(null);
        setEntityIDs(ids);
        setEntities(entities);
        setLabelSize({ width, length });
    };

    const generateText = (info?: TeamLabelEntity) => {
        const id = uuidv4();
        const entity = { 
            ...{
                text: newText,
                position: { x: 0, y: 0 },
                textSize: newTextSize,
                bold: newBoldStatus,
                italic: newItalicStatus,
            },
            ...info,
        };
        return {
            id,
            entity
        }
    }

    const addTextEntity = (info?: TeamLabelEntity) => {
        const { id, entity } = generateText(info);

        setEntityIDs([...entityIDs, id]);
        setEntities({
            ...entities,
            [id]: entity
        });
    }

    const addQRCodeEntity = (info?: TeamLabelEntity) => {
        if (qrCodeID === null) {
            const { id, entity } = generateText(info);
            entity.text = "";
            entity.textSize = info?.textSize ?? 50;

            setQRCodeID(id);
            setEntityIDs([...entityIDs, id]);
            setEntities({
                ...entities,
                [id]: entity
            });
        }
    }

    const onTextSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newSize = parseInt(event.currentTarget.value);

        if (selectedEntityID === null) {
            return setNewTextSize(newSize);
        }

        setEntities({
            ...entities,
            [selectedEntityID as string]: {
                ...entities[selectedEntityID as string],
                textSize: newSize,
            }
        })
    }

    const onTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const updatedText = event.currentTarget.value;

        if (selectedEntityID === null) {
            return setNewText(updatedText);
        }

        setEntities({
            ...entities,
            [selectedEntityID as string]: {
                ...entities[selectedEntityID as string],
                text: updatedText,
            }
        });
    }

    const onTextClickDown = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        event.stopPropagation();
        if (isSelectedEntityHeld) 
            return;

        if (selectedEntityID !== null) {
            const selectedText = document.getElementById(selectedEntityID);
            if (selectedText !== null)
                selectedText.classList.remove("label-text-selected")
        }

        event.currentTarget.classList.add("label-text-selected");
        const textID = event.currentTarget.id;

        updateLastMousePosition(event);
        setIsSelectedEntityHeld(true);
        setSelectedEntityID(textID);
    }

    const onTextClickUp = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        event.stopPropagation();
        updateLastMousePosition(event);
        setIsSelectedEntityHeld(false);
    }

    const onTextDrag = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        event.stopPropagation();

        if (!isSelectedEntityHeld)
            return;

        const id = selectedEntityID as string;
        const entity = document.getElementById(id);
        if (entity === null)
            return;

        const editor = editorRef.current;
        if (editor === null)
            return;


        const dx = event.clientX - lastMousePositionRef.current.x;
        const dy = event.clientY - lastMousePositionRef.current.y;

        var x = entities[id].position.x as number + dx;
        var y = entities[id].position.y as number + dy;

        if (event.shiftKey) {
            var nearbyTextX = findNearbyText({ x, y }, 'x', [id]); 
            var nearbyTextY = findNearbyText({ x, y }, 'y', [id]); 

            if (nearbyTextX !== null) {
                x = nearbyTextX;
            }

            if (nearbyTextY !== null) {
                y = nearbyTextY;
            }
        } 

        const editorRect = editor.getBoundingClientRect();

        // only update the position if the text will be within the editor
        if (x < 0 || x + entity.offsetWidth > editorRect.width || y < 0 || y + entity.offsetHeight > editorRect.height)
            return;

        setEntities({
            ...entities,
            [id]: {
                ...entities[id],
                position: { x, y },
            }
        })

        updateLastMousePosition(event);
    }

    const onDeleteClick = () => {
        if (selectedEntityID === null)
            return; 

        const newTextIDs = entityIDs.filter(id => id !== selectedEntityID);

        if (selectedEntityID === qrCodeID)
            setQRCodeID(null);

        setSelectedEntityID(null);
        setEntityIDs(newTextIDs);
        delete entities[selectedEntityID];
        setEntities({ ...entities });
    }

    const onSaveClick = () => {
        const labelData = Object.values(entities);
        const label: CreateTeamLabelRequirements = {
            team_name: team,
            width: labelSize.width as number,
            length: labelSize.length as number,
            data: labelData
        }
        onSave(label);
    }

    const onEditorClick = () => {
        if (selectedEntityID !== null) {
            const selectedText = document.getElementById(selectedEntityID);
            if (selectedText !== null)
                selectedText.classList.remove("label-text-selected")
        }
        setIsSelectedEntityHeld(false);
        setSelectedEntityID(null);
    }

    const onResetPositionClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        setEntities({
            ...entities,
            [selectedEntityID as string]: {
                ...entities[selectedEntityID as string],
                position: {
                    x: 0,
                    y: 0,
                }
            }
        });
    }

    const onBoldClick = () => {
        if (selectedEntityID === null)
            return setNewBoldStatus(!newBoldStatus);

        setEntities({
            ...entities,
            [selectedEntityID]: {
                ...entities[selectedEntityID],
                bold: !entities[selectedEntityID].bold,
            }
        });
    }

    const onItalicClick = () => {
        if (selectedEntityID === null)
            return setNewItalicStatus(!newItalicStatus);

        setEntities({
            ...entities,
            [selectedEntityID]: {
                ...entities[selectedEntityID],
                italic: !entities[selectedEntityID].italic,
            
            }
        });
    }

    return (
        <Paper 
            className="label-selector-and-editor"
        >
        <ListDisplay
            items={labels[team] ?? []}
            header={<Typography variant="h6" color="primary">Select a label size</Typography>}
            itemFormatter={(label, index) => { return {
                content: <Typography variant="body1" color="primary">{label.width}mm x {label.length}mm</Typography>,
                clickable: true,
            }}}
            onListItemClick={(item, value) => {
                loadLabel(value);
            }}
            onListItemSubmit={(value: string) => {
                const [width, length] = value.match(/(\d+)+/g) ?? [];
                if (width === undefined || length === undefined)
                    return;
                
                createLabel({
                    team_name: team,
                    width: parseInt(width),
                    length: parseInt(length),
                    data: [],
                });
            }}
            onListItemDelete={(item, value) => {
                // deleteLabel(value);
            }}
            editable
            // deletable
        /> 
        <div 
            className="label-editor-container"
            style={{
                width: `${editorSize.width}${typeof editorSize.width === "number" ? "px" : ""}`,
                height: `${editorSize.height}${typeof editorSize.height === "number" ? "px" : ""}`,
            }}
        >
            <div className="label-editor-toolbar">
                <Button 
                    onClick={() => addTextEntity()}
                >
                    Add Text
                </Button>

                <Button
                    disabled={qrCodeID !== null}
                    onClick={() => addQRCodeEntity()}
                >
                    Add QR Code
                </Button>

                <Button
                    disabled={selectedEntityID === null}
                    onClick={onDeleteClick}
                >
                    Delete Text
                </Button>

                <Button
                    disabled={selectedEntityID === null}
                    onClick={onResetPositionClick}
                >
                    Reset Position
                </Button>

                <input 
                    type="number" 
                    onChange={onTextSizeChange} 
                    value={
                        selectedEntityID !== null ? entities[selectedEntityID].textSize : newTextSize
                    } 
                    style={{
                        width: "5%",
                    }}
                />

                <Checkbox 
                    onChange={onBoldClick}
                    checked={selectedEntityID !== null ? entities[selectedEntityID].bold : newBoldStatus}
                    icon={<FormatBoldOutlined />}
                    checkedIcon={<FormatBold />}
                />

                <Checkbox 
                    onChange={onItalicClick}
                    checked={selectedEntityID !== null ? entities[selectedEntityID].italic : newItalicStatus}
                    icon={<FormatItalicOutlined />}
                    checkedIcon={<FormatItalic />}
                />

                {toolbarComponents}

                <Button
                    onClick={onSaveClick}
                >
                    Save
                </Button>
            </div>

            <div 
                className="label-editor" 
                onMouseUp={onEditorClick}
                onMouseLeave={onTextClickUp}
                ref={editorRef}
                style={{
                    width: `${labelSize.length}${typeof labelSize.length === "number" ? "mm" : ""}`,
                    height: `${labelSize.width}${typeof labelSize.width === "number" ? "mm" : ""}`,
                }}
            >
                {
                    entityIDs.map((entityID) => {
                        const entityInfo = entities[entityID];
                        return (
                            <LabelText
                                key={entityID}
                                id={entityID}
                                position={entityInfo.position}
                                textSizePX={entityInfo.textSize}
                                bold={entityInfo.bold}
                                italic={entityInfo.italic}
                                onMouseDown={onTextClickDown}
                                onMouseUp={onTextClickUp}
                                onMouseMove={onTextDrag}
                            >
                                {entityInfo.text}
                            </LabelText>
                        );
                    })
                }
                {
                    qrCodeID !== null && entityIDs.length > 0 && entities[qrCodeID] !== undefined
                    ? <div 
                        id={qrCodeID}
                        className="label-qr-code-container"
                        style={{
                            position: "absolute",
                            top: `${entities[qrCodeID].position.y}px`,
                            left: `${entities[qrCodeID].position.x}px`,
                            width: `${entities[qrCodeID].textSize}px`,
                            height: `${entities[qrCodeID].textSize}px`,
                            zIndex: 0
                        }}
                        onMouseDown={onTextClickDown}
                        onMouseUp={onTextClickUp}
                        onMouseMove={onTextDrag}
                    >
                        <img 
                            src={qr_image} 
                            style={{
                                userSelect: "none",
                                width: "100%",
                                height: "100%",  
                                zIndex: 0
                            }}
                            draggable={false}
                        ></img>
                    </div>
                    : null
                }
            </div>

            <div className="label-editor-text-input-container">
                <input
                    className="label-editor-text-input"
                    type="text"
                    onChange={onTextChange}
                    disabled={selectedEntityID !== null && selectedEntityID === qrCodeID}
                    value={
                        selectedEntityID !== null ? entities[selectedEntityID].text : newText
                    }
                />
                <p>
                    {selectedEntityID !== null 
                        ? `(${entities[selectedEntityID].position.x}, ${entities[selectedEntityID].position.y})`
                        : `(0, 0)`
                    }
                </p>
            </div>

            {
                footerComponents 
                ?
                <div className="label-editor-footer">
                    {footerComponents}
                </div>
                : 
                <></>
            }
        </div>
        </Paper>
    );
}

export default LabelEditor;