<?xml version="1.0" encoding="utf-8"?>
<applicationModel>
  <name>Application Model</name>
  <className>AppModel</className>
  <objects>
    <object type="Window" technology="WPF">
      <name>OpenText MyFlight Sample</name>
      <codeName>OpentextMyflightSampleWindow</codeName>
      <identification>
        <properties>
          <property name="FullType" type="string">window</property>
          <property name="WindowTitleRegExp" type="string">OpenText MyFlight Sample Application</property>
          <property name="ObjectName" type="string">OpenText MyFlight Sample Application</property>
        </properties>
      </identification>
      <children>
        <object type="EditField" technology="WPF">
          <name>password</name>
          <codeName>PasswordEditField</codeName>
          <identification>
            <properties>
              <property name="ObjectName" type="string">password</property>
            </properties>
          </identification>
          <children />
        </object>
        <object type="EditField" technology="WPF">
          <name>agentName</name>
          <codeName>AgentnameEditField</codeName>
          <identification>
            <properties>
              <property name="ObjectName" type="string">agentName</property>
            </properties>
          </identification>
          <children />
        </object>
        <object type="ComboBox" technology="WPF">
          <name>toCity</name>
          <codeName>TocityComboBox</codeName>
          <identification>
            <properties>
              <property name="ObjectName" type="string">toCity</property>
            </properties>
          </identification>
          <children />
        </object>
        <object type="ComboBox" technology="WPF">
          <name>fromCity</name>
          <codeName>FromcityComboBox</codeName>
          <identification>
            <properties>
              <property name="ObjectName" type="string">fromCity</property>
            </properties>
          </identification>
          <children />
        </object>
        <object type="Button" technology="WPF">
          <name>OK</name>
          <codeName>OkButton</codeName>
          <identification>
            <properties>
              <property name="Text" type="string">OK</property>
              <property name="ObjectName" type="string">okButton</property>
            </properties>
          </identification>
          <children />
        </object>
        <object type="Button" technology="WPF">
          <name>FIND FLIGHTS</name>
          <codeName>FindFlightsButton</codeName>
          <identification>
            <properties>
              <property name="Text" type="string">FIND FLIGHTS</property>
              <property name="ObjectName" type="string">FIND FLIGHTS</property>
            </properties>
          </identification>
          <children />
        </object>
        <object type="Dialog" technology="Standard Windows">
          <name>Login Failed</name>
          <codeName>LoginFailedDialog</codeName>
          <identification>
            <properties>
              <property name="Text" type="string">Login Failed</property>
              <property name="NativeClass" type="string">#32770</property>
              <property name="IsOwnedWindow" type="boolean">true</property>
              <property name="IsChildWindow" type="boolean">false</property>
            </properties>
          </identification>
          <children />
        </object>
      </children>
    </object>
  </objects>
</applicationModel>